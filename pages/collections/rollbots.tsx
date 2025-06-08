import { MANUAL_ROLLBOTS } from '@/lib/constants/rollbotsNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import NFTCollectionView from '@/components/collections/NFTCollectionView';

export default function RollbotsCollection() {
  const collection = COLLECTIONS.find(c => c.name === 'Rollbots')!;
  
  return (
    <CollectionLayout collection={collection}>
      <NFTCollectionView 
        collection={collection}
        nfts={MANUAL_ROLLBOTS}
        showKingDaoBadge={true}
      />
    </CollectionLayout>
  );
}