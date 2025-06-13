import { Collection } from '@/lib/daoCollections';
import { useQuery } from '@tanstack/react-query';

interface CollectionStats {
  totalSupply: number;
  floorPrice?: number;
}

export function useCollectionStats(collection: Collection): CollectionStats {
  // For now, we'll use hardcoded values for total supply
  const totalSupplyMap: { [key: string]: number } = {
    'Rollbots': 10000,
    'Sports Rollbots': 5000,
    'ZK Race': 10000,
    'KING': 10000,
    'Wilder World': 10000,
    'DogePound': 10000
  };

  // Fetch floor price from an API (mock for now)
  const { data: floorPrice } = useQuery({
    queryKey: ['floorPrice', collection.contract],
    queryFn: async () => {
      // In a real implementation, this would fetch from an API
      // For now, return a random floor price between 0.1 and 2 ETH
      return Math.random() * 1.9 + 0.1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    totalSupply: totalSupplyMap[collection.name] || 10000,
    floorPrice
  };
} 