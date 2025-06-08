import { useState, useEffect } from 'react';
import { ZKRaceNFT } from '@/lib/constants/zkRaceNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import Image from 'next/image';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp, Crown } from 'lucide-react';
import { fetchZKRace } from '@/services/zkRaceService';
import { Trait } from '@/types/nft';
import NFTCollectionView from '@/components/collections/NFTCollectionView';
import { useCollectionStats } from '@/hooks/useCollectionStats';

const ITEMS_PER_PAGE = 20;

interface TraitStats {
  [traitType: string]: {
    values: { [value: string]: number };
    count: number;
  };
}

export default function ZKRaceCollection() {
  const [racers, setRacers] = useState<ZKRaceNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const collection = COLLECTIONS.find(c => c.name === 'ZK Race')!;
  const { totalSupply, floorPrice } = useCollectionStats(collection);
  
  // Fetch NFTs
  useEffect(() => {
    const loadNFTs = async () => {
      try {
        const nfts = await fetchZKRace();
        setRacers(nfts);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load ZK Race NFTs:', error);
        setIsLoading(false);
      }
    };

    loadNFTs();
  }, []);

  if (isLoading) {
    return (
      <CollectionLayout collection={collection}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </CollectionLayout>
    );
  }

  return (
    <CollectionLayout collection={collection}>
      <NFTCollectionView 
        collection={collection}
        nfts={racers}
        showKingDaoBadge={true}
        totalSupply={totalSupply}
        floorPrice={floorPrice}
      />
    </CollectionLayout>
  );
} 