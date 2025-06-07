import { Alchemy, Network } from 'alchemy-sdk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const TOKEN_IDS = [73, 164, 218, 267, 771];
const IPFS_HASH = 'QmPcuQKwdayWwhUKY64sJUxFAXkhpaCpY1FdaHHXgeeT9h';
const CONTRACT_ADDRESS = '0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

// List of IPFS gateways to try
const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.eth.aragon.network/ipfs/'
];

async function downloadImage(tokenId: number) {
  let lastError;

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${IPFS_HASH}/${tokenId}.png`;
      console.log(`🔄 Trying gateway: ${gateway} for token #${tokenId}`);
      
      const response = await axios({
        url,
        responseType: 'arraybuffer',
        timeout: 10000,
        validateStatus: null,
        headers: {
          'Accept': 'image/png',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (response.status === 200) {
        const outputDir = path.join(process.cwd(), 'public', 'collections', 'king');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${tokenId}.png`);
        fs.writeFileSync(outputPath, response.data);
        console.log(`✅ Successfully downloaded image for token #${tokenId}`);
        return;
      } else {
        console.log(`⚠️ Gateway ${gateway} returned status ${response.status} for token #${tokenId}`);
      }
    } catch (error) {
      lastError = error;
      console.log(`⚠️ Gateway ${gateway} failed for token #${tokenId}:`, error.message);
    }
  }

  throw lastError || new Error('All gateways failed');
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
  console.log('🚀 Starting to fetch KING NFT images...');

  for (const tokenId of TOKEN_IDS) {
    try {
      console.log(`\n📥 Processing token #${tokenId}...`);
      await downloadImage(tokenId);

      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Failed to process token #${tokenId}:`, error.message);
    }
  }

  console.log('✨ Finished fetching images!');
}

// Run the script
fetchImages().catch(console.error); 