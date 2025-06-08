import { MANUAL_WILDER_WORLD, WilderWorldNFT } from '@/lib/constants/wilderWorldNFTs';

export async function fetchWilderWorld(): Promise<WilderWorldNFT[]> {
  // For now, we'll return the manually fetched NFTs
  // In the future, this could be expanded to fetch from the blockchain in real-time
  return MANUAL_WILDER_WORLD;
} 