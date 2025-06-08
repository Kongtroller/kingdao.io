import { alchemy } from '@/lib/alchemy';
import { DogePoundNFT } from '@/lib/constants/dogePoundNFTs';
import { Nft } from 'alchemy-sdk';

const DOGEPOUND_ADDRESS = '0xF4ee95274741437636e748DdAc70818B4ED7d043';

interface AlchemyNFTMetadata extends Nft {
  rawMetadata?: {
    name?: string;
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

export async function fetchDogePound(tokenId: string = '8944'): Promise<DogePoundNFT | null> {
  try {
    const nft = await alchemy.nft.getNftMetadata(
      DOGEPOUND_ADDRESS,
      tokenId,
      { refreshCache: true }
    ) as AlchemyNFTMetadata;

    if (!nft) return null;

    return {
      tokenId: nft.tokenId,
      name: nft.rawMetadata?.name || `DogePound #${nft.tokenId}`,
      description: nft.description,
      imageUrl: `/collections/doge-pound/${tokenId}.png`,
      traits: nft.rawMetadata?.attributes || []
    };
  } catch (error) {
    console.error('Failed to fetch DogePound NFT:', error);
    return null;
  }
} 