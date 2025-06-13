import { Alchemy, Network, Nft } from 'alchemy-sdk';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import { DogePoundNFT } from '../lib/constants/dogePoundNFTs';

const DOGEPOUND_ADDRESS = '0xF4ee95274741437636e748DdAc70818B4ED7d043';
const TOKEN_ID = '8944';

interface NFTMetadata {
  contract: {
    address: string;
  };
  tokenId: string;
  tokenType: string;
  name: string;
  description: string;
  image: {
    cachedUrl: string;
    thumbnailUrl: string;
    pngUrl: string;
    originalUrl: string;
  };
  raw: {
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes: Array<{
        trait_type: string;
        value: string;
      }>;
    };
  };
}

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

async function downloadImage(url: string, tokenId: string) {
  try {
    console.log(`📥 Downloading image from URL: ${url}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imagePath = path.join(process.cwd(), 'public', 'collections', 'doge-pound');
    
    console.log(`📁 Creating directory: ${imagePath}`);
    // Create directory if it doesn't exist
    await fs.mkdir(imagePath, { recursive: true });
    
    // Save image
    const fullImagePath = path.join(imagePath, `${tokenId}.png`);
    console.log(`💾 Saving image to: ${fullImagePath}`);
    
    await fs.writeFile(fullImagePath, response.data);
    console.log(`✅ Successfully saved image for token ${tokenId}`);
  } catch (error) {
    console.error(`❌ Failed to download image for token ${tokenId}:`, error);
    throw error;
  }
}

async function fetchDogePoundData() {
  try {
    console.log('🔍 Fetching DogePound NFT data...');
    
    const nft = await alchemy.nft.getNftMetadata(
      DOGEPOUND_ADDRESS,
      TOKEN_ID,
      { refreshCache: true }
    ) as unknown as NFTMetadata;

    if (!nft) {
      console.error('❌ No NFT data found');
      return;
    }

    console.log('📋 NFT Metadata:', JSON.stringify(nft, null, 2));

    // Download image - try different possible image URLs
    const imageUrl = nft.image?.originalUrl || 
                    nft.image?.cachedUrl || 
                    nft.image?.pngUrl || 
                    nft.raw?.metadata?.image;

    if (imageUrl) {
      console.log('🖼️ Found image URL:', imageUrl);
      await downloadImage(imageUrl, TOKEN_ID);
    } else {
      console.error('❌ No image URL found in metadata');
      return;
    }

    // Create NFT data
    const dogePoundNFT: DogePoundNFT = {
      tokenId: nft.tokenId,
      name: nft.raw?.metadata?.name || `DogePound #${nft.tokenId}`,
      description: nft.description,
      imageUrl: `/collections/doge-pound/${TOKEN_ID}.png`,
      traits: nft.raw?.metadata?.attributes || []
    };

    // Save NFT data
    const dataPath = path.join(process.cwd(), 'lib', 'constants', 'dogePoundNFTs.ts');
    console.log(`📝 Saving NFT data to: ${dataPath}`);
    const fileContent = `import { Trait } from '@/types/nft';

export interface DogePoundNFT {
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  traits: Trait[];
}

export const MANUAL_DOGEPOUND: DogePoundNFT[] = [${JSON.stringify(dogePoundNFT, null, 2)}];`;

    await fs.writeFile(dataPath, fileContent);
    console.log('✅ Successfully saved NFT data');

  } catch (error) {
    console.error('❌ Failed to fetch DogePound data:', error);
  }
}

// Run the script
fetchDogePoundData().then(() => {
  console.log('✨ Done!');
}).catch(console.error); 