import { Alchemy, Network, Nft } from 'alchemy-sdk';
import { SportsRollbotNFT } from '@/lib/constants/sportsRollbotsNFTs';

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY || '',
  network: Network.ETH_MAINNET,
  maxRetries: 2
});

export const SPORTS_ROLLBOTS_ADDRESS = '0x1de7abda2d73a01aa8dca505bdcb773841211daf';

const TOKEN_IDS = [
  6980, 5852, 7644, 6766, 6935, 3794, 1678, 195, 1084, 1504,
  3197, 282, 7271, 6352, 6056, 209, 1048, 7575, 5250, 8916,
  2260, 9979, 2343, 4223, 4650, 4077
];

interface AlchemyNFTMetadata extends Nft {
  rawMetadata?: {
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  media?: Array<{
    gateway: string;
    raw: string;
  }>;
}

export async function fetchSportsRollbots(): Promise<SportsRollbotNFT[]> {
  try {
    const nfts = await Promise.all(
      TOKEN_IDS.map(async (tokenId) => {
        try {
          const nft = await alchemy.nft.getNftMetadata(
            SPORTS_ROLLBOTS_ADDRESS,
            tokenId.toString(),
            { refreshCache: true }
          ) as AlchemyNFTMetadata;

          // Use the actual image URL from Alchemy
          const imageUrl = `/collections/sports-rollbots/${tokenId}.webp`;

          return {
            tokenId: nft.tokenId,
            name: `Sports Rollbot #${nft.tokenId}`,
            description: "A unique Sports Rollbot from the collection",
            imageUrl,
            traits: nft.rawMetadata?.attributes || []
          };
        } catch (error) {
          console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
          return null;
        }
      })
    );

    return nfts.filter((nft): nft is SportsRollbotNFT => nft !== null);
  } catch (error) {
    console.error('Failed to fetch Sports Rollbots:', error);
    return [];
  }
} 