import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { KingNFT } from '@/lib/constants/kingNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import Image from 'next/image';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp, Crown } from 'lucide-react';
import { fetchKing } from '@/services/kingService';
import { Trait } from '@/types/nft';
import { useQuery } from '@tanstack/react-query';
import NFTCollectionView from '@/components/collections/NFTCollectionView';

const ITEMS_PER_PAGE = 20;

interface TraitStats {
  [traitType: string]: {
    values: { [value: string]: number };
    count: number;
  };
}

export default function KingCollection() {
  const collection = COLLECTIONS.find(c => c.name === 'KING')!;

  const { data: nfts, isLoading } = useQuery({
    queryKey: ['king-nfts'],
    queryFn: fetchKing,
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
          Failed to load KING NFTs
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
      />
    </CollectionLayout>
  );
} 