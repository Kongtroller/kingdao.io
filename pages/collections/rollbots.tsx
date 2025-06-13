import { MANUAL_ROLLBOTS } from '@/lib/constants/rollbotsNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import NFTCollectionView from '@/components/collections/NFTCollectionView';

export default function RollbotsCollection() {
  const collection = COLLECTIONS.find(c => c.name === 'Rollbots')!;
  
  // Calculate average marketplace value for floor price
  const floorPrice = Math.min(
    ...MANUAL_ROLLBOTS
      .map(nft => {
        const marketplaceValue = nft.traits.find(t => t.trait_type === 'Marketplace')?.value;
        return typeof marketplaceValue === 'number' ? marketplaceValue : 
               typeof marketplaceValue === 'string' ? parseFloat(marketplaceValue) : Infinity;
      })
  ) / 1000; // Convert to ETH

  return (
    <CollectionLayout collection={collection}>
      <NFTCollectionView 
        collection={collection}
        nfts={MANUAL_ROLLBOTS}
        showKingDaoBadge={true}
        totalSupply={10000}
        floorPrice={floorPrice}
      />
    </CollectionLayout>
  );
}