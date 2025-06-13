import { alchemy } from '@/lib/alchemy';
import { KingNFT, MANUAL_KING } from '@/lib/constants/kingNFTs';
import { AlchemyNFTMetadata } from '@/types/alchemy';

// Actual token IDs
const TOKEN_IDS = [73, 164, 218, 267, 771];

export async function fetchKing(): Promise<KingNFT[]> {
  try {
    // For development, return manual data
    // TODO: Replace with actual Alchemy fetch when contract is deployed
    return MANUAL_KING;

    // Uncomment below for actual implementation
    /*
    const nfts = await Promise.all(
      TOKEN_IDS.map(async (tokenId) => {
        try {
          const nft = await alchemy.nft.getNftMetadata(
            KING_ADDRESS,
            tokenId.toString(),
            { refreshCache: true }
          ) as AlchemyNFTMetadata;

          const imageUrl = `/collections/king/${tokenId}.png`;

          return {
            tokenId: nft.tokenId,
            name: `KING #${nft.tokenId}`,
            description: "The official NFT collection of KingDAO, granting governance rights and exclusive benefits.",
            imageUrl,
            traits: nft.rawMetadata?.attributes || []
          };
        } catch (error) {
          console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
          return null;
        }
      })
    );

    return nfts.filter((nft): nft is KingNFT => nft !== null);
    */
  } catch (error) {
    console.error('Failed to fetch KING NFTs:', error);
    return [];
  }
} 