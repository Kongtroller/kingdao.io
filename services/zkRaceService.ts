import { alchemy } from '@/lib/alchemy';
import { ZKRaceNFT, MANUAL_ZK_RACE } from '@/lib/constants/zkRaceNFTs';
import { AlchemyNFTMetadata } from '@/types/alchemy';

// Actual token IDs
const TOKEN_IDS = [
  177, 1546, 1595, 4006, 4873, 5284, 5631, 5861, 6187, 6489,
  7195, 7947, 8292, 8806, 9097, 9300, 9648, 9970, 10071, 10236
];

export async function fetchZKRace(): Promise<ZKRaceNFT[]> {
  try {
    // For development, return manual data
    // TODO: Replace with actual Alchemy fetch when contract is deployed
    return MANUAL_ZK_RACE;

    // Uncomment below for actual implementation
    /*
    const nfts = await Promise.all(
      TOKEN_IDS.map(async (tokenId) => {
        try {
          const nft = await alchemy.nft.getNftMetadata(
            ZK_RACE_ADDRESS,
            tokenId.toString(),
            { refreshCache: true }
          ) as AlchemyNFTMetadata;

          const imageUrl = `/collections/zk-race/${tokenId}.png`;

          return {
            tokenId: nft.tokenId,
            name: `ZK Racer #${nft.tokenId}`,
            description: "A high-speed racing NFT powered by ZK technology",
            imageUrl,
            traits: nft.rawMetadata?.attributes || []
          };
        } catch (error) {
          console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
          return null;
        }
      })
    );

    return nfts.filter((nft): nft is ZKRaceNFT => nft !== null);
    */
  } catch (error) {
    console.error('Failed to fetch ZK Race NFTs:', error);
    return [];
  }
} 