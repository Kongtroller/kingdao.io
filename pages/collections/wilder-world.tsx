import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { WilderWorldNFT } from '@/lib/constants/wilderWorldNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { fetchWilderWorld } from '@/services/wilderWorldService';
import { Trait } from '@/types/nft';
import { useQuery } from '@tanstack/react-query';
import NFTCollectionView from '@/components/collections/NFTCollectionView';
import { useCollectionStats } from '@/hooks/useCollectionStats';

const ITEMS_PER_PAGE = 20;

interface TraitStats {
  [traitType: string]: {
    values: { [value: string]: number };
    count: number;
  };
}

export default function WilderWorldCollection() {
  const collection = COLLECTIONS.find(c => c.name === 'Wilder World')!;
  const { totalSupply, floorPrice } = useCollectionStats(collection);

  const { data: nfts, isLoading } = useQuery({
    queryKey: ['wilder-world-nfts'],
    queryFn: fetchWilderWorld,
  });

  if (isLoading) {
    return (
      <CollectionLayout collection={collection}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </CollectionLayout>
    );
  }

  if (!nfts) {
    return (
      <CollectionLayout collection={collection}>
        <div className="text-red-500 dark:text-red-400 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
          Failed to load Wilder World NFTs
        </div>
      </CollectionLayout>
    );
  }

  return (
    <CollectionLayout collection={collection}>
      <NFTCollectionView 
        collection={collection}
        nfts={nfts}
        showKingDaoBadge={true}
        totalSupply={totalSupply}
        floorPrice={floorPrice}
      />
    </CollectionLayout>
  );
} 