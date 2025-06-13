import { Alchemy, Network } from 'alchemy-sdk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const TOKEN_IDS = [
  177, 1546, 1595, 4006, 4873, 5284, 5631, 5861, 6187, 6489,
  7195, 7947, 8292, 8806, 9097, 9300, 9648, 9970, 10071, 10236
];

const CONTRACT_ADDRESS = '0x9d77cb4D8371736e2A2b2bfAa677b7841cDc8fC1';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.MATIC_MAINNET,
};

const alchemy = new Alchemy(settings);

async function downloadImage(url: string, tokenId: number) {
  try {
    console.log(`🔄 Attempting to download image from URL: ${url}`);
    
    const response = await axios({
      url,
      responseType: 'arraybuffer',
      timeout: 10000, // 10 second timeout
      validateStatus: null, // Allow any status code
    });

    if (response.status !== 200) {
      throw new Error(`HTTP status ${response.status}: ${response.statusText}`);
    }

    const outputDir = path.join(process.cwd(), 'public', 'collections', 'zk-race');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save as PNG since that's the original format
    const outputPath = path.join(outputDir, `${tokenId}.png`);
    fs.writeFileSync(outputPath, response.data);
    console.log(`✅ Successfully downloaded image for token #${tokenId}`);
  } catch (error) {
    console.error(`❌ Failed to download image for token #${tokenId}:`, error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
    }
  }
}

async function fetchMetadataFromUri(uri: string) {
  try {
    const response = await axios.get(uri);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch metadata from URI:', error);
    return null;
  }
}

async function fetchImages() {
  console.log('🚀 Starting to fetch ZK Race NFT images...');

  for (const tokenId of TOKEN_IDS) {
    try {
      console.log(`\n📥 Fetching metadata for token #${tokenId}...`);
      const nft = await alchemy.nft.getNftMetadata(
        CONTRACT_ADDRESS,
        tokenId.toString()
      );

      // First try to get the image URL from Alchemy metadata
      let imageUrl = nft.raw.metadata?.image;
      
      // If no image URL in Alchemy metadata, try fetching from token URI
      if (!imageUrl && nft.raw.tokenUri) {
        console.log(`🔍 Fetching metadata from token URI: ${nft.raw.tokenUri}`);
        const metadata = await fetchMetadataFromUri(nft.raw.tokenUri);
        imageUrl = metadata?.image;
      }

      if (imageUrl) {
        await downloadImage(imageUrl, tokenId);
      } else {
        console.error(`❌ No image URL found for token #${tokenId}`);
      }

      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to fetch metadata for token #${tokenId}:`, error);
    }
  }

  console.log('✨ Finished fetching images!');
}

// Run the script
fetchImages().catch(console.error); 