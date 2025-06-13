import { Collection } from '@/lib/daoCollections';

interface FloorPriceHistory {
  timestamp: string;
  price: number;
}

// In a real implementation, this would fetch from an API
// For now, we'll generate mock data
export async function getFloorPriceHistory(collection: Collection): Promise<FloorPriceHistory[]> {
  // Generate 30 days of mock data
  const history: FloorPriceHistory[] = [];
  const now = new Date();
  const basePrice = Math.random() * 2 + 0.5; // Random base price between 0.5 and 2.5 ETH

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a price that varies within ±30% of the base price
    const variation = (Math.random() - 0.5) * 0.6;
    const price = basePrice * (1 + variation);

    history.push({
      timestamp: date.toISOString(),
      price: Number(price.toFixed(4))
    });
  }

  return history;
} 