import { COLLECTIONS } from '@/lib/daoCollections';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import { fetchDogePound } from '@/services/dogePoundService';
import { useQuery } from '@tanstack/react-query';
import NFTCollectionView from '@/components/collections/NFTCollectionView';

export default function DogePoundCollection() {
  const { data: nft, isLoading, error } = useQuery({
    queryKey: ['dogePound', '8944'],
    queryFn: () => fetchDogePound('8944')
  });

  const collection = COLLECTIONS.find(c => c.name === 'DogePound');
  if (!collection) return null;

  if (isLoading) {
    return (
      <CollectionLayout collection={collection}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </CollectionLayout>
    );
  }

  if (error || !nft) {
    return (
      <CollectionLayout collection={collection}>
        <div className="text-red-500 dark:text-red-400 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
          Failed to load DogePound NFT
        </div>
      </CollectionLayout>
    );
  }

  return (
    <CollectionLayout collection={collection}>
      <NFTCollectionView 
        collection={collection}
        nfts={[nft]}
        showKingDaoBadge={true}
      />
    </CollectionLayout>
  );
} 