const { Alchemy, Network } = require('alchemy-sdk');
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

type AlchemyNft = {
  tokenId: string;
  raw: {
    metadata?: {
      image?: string;
      attributes?: Array<{
        trait_type: string;
        value: string;
      }>;
    };
  };
};

// Configure Alchemy SDK
const config = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY || '',
  network: Network.ETH_MAINNET,
  maxRetries: 2
};

const alchemy = new Alchemy(config);

const SPORTS_ROLLBOTS_ADDRESS = '0x1de7abda2d73a01aa8dca505bdcb773841211daf';
const PLACEHOLDER_IMAGE_PATH = '/images/placeholder-nft.svg';
const BASE_DELAY = 1000; // Base delay of 1 second

// IPFS Gateway configuration
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.eth.aragon.network/ipfs/'
];

const TOKEN_IDS = [
  6980, 5852, 7644, 6766, 6935, 3794, 1678, 195, 1084, 1504,
  3197, 282, 7271, 6352, 6056, 209, 1048, 7575, 5250, 8916,
  2260, 9979, 2343, 4223, 4650, 4077
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = 2,
  baseDelay: number = BASE_DELAY
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) { // Don't sleep on the last attempt
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Retry ${i + 1} failed, waiting ${delay}ms before next attempt`);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

function isValidImageContentType(contentType: string): boolean {
  const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  return validTypes.some(type => contentType.toLowerCase().startsWith(type));
}

async function tryDownloadImage(url: string): Promise<Buffer | null> {
  try {
    const response = await axios({
      url,
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000,
      validateStatus: null // Don't throw on any status code
    });

    // Check if we got a valid image
    const contentType = response.headers['content-type'];
    if (response.status !== 200 || !isValidImageContentType(contentType)) {
      console.log(`Invalid response from ${url}: status=${response.status}, content-type=${contentType}`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error downloading from ${url}:`, error.message);
    return null;
  }
}

async function downloadImage(tokenId: string) {
  try {
    // Try Alchemy first with retries
    const nft = await retryWithBackoff(() => 
      alchemy.nft.getNftMetadata(
        SPORTS_ROLLBOTS_ADDRESS,
        tokenId.toString(),
        { refreshCache: true }
      )
    ) as AlchemyNft;

    let imageUrl = nft.raw.metadata?.image;
    
    if (!imageUrl) {
      console.log(`No image URL found for token ${tokenId}, using placeholder`);
      return;
    }

    // Try to download the image
    let imageData: Buffer | null = null;

    // If it's an IPFS URL, try multiple gateways
    if (imageUrl.startsWith('ipfs://')) {
      const ipfsHash = imageUrl.replace('ipfs://', '');
      console.log(`Trying IPFS gateways for token ${tokenId}`);
      
      for (const gateway of IPFS_GATEWAYS) {
        const fullUrl = `${gateway}${ipfsHash}`;
        console.log(`Trying IPFS gateway: ${gateway}`);
        imageData = await tryDownloadImage(fullUrl);
        if (imageData) {
          console.log(`Successfully downloaded from gateway: ${gateway}`);
          break;
        }
        // Add a small delay between gateway attempts
        await sleep(500);
      }
    } else {
      // Try direct URL
      console.log(`Trying direct URL for token ${tokenId}: ${imageUrl}`);
      imageData = await tryDownloadImage(imageUrl);
    }

    if (!imageData) {
      console.log(`Failed to download valid image for token ${tokenId} from any source`);
      return;
    }

    const imagePath = path.join(process.cwd(), 'public', 'collections', 'sports-rollbots', `${tokenId}.webp`);
    await fs.writeFile(imagePath, imageData);
    console.log(`Successfully downloaded image for token ${tokenId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Failed to download image for token ${tokenId} after all retries:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      });
    } else {
      console.error(`Failed to fetch metadata for token ${tokenId} after all retries:`, error);
    }
  }
}

async function updateSportsRollbotsFile(nfts: AlchemyNft[]) {
  const sportsRollbotsData = nfts.map(nft => ({
    tokenId: nft.tokenId,
    name: `Sports Rollbot #${nft.tokenId}`,
    description: "A unique Sports Rollbot from the collection",
    imageUrl: `/collections/sports-rollbots/${nft.tokenId}.webp`,
    traits: nft.raw.metadata?.attributes || []
  }));

  const fileContent = `export interface SportsRollbotNFT {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  traits: Array<{
    trait_type: string;
    value: string;
  }>;
}

export const SPORTS_ROLLBOTS_ADDRESS = '${SPORTS_ROLLBOTS_ADDRESS}';

// Add your Sports Rollbots NFTs here
export const MANUAL_SPORTS_ROLLBOTS: SportsRollbotNFT[] = ${JSON.stringify(sportsRollbotsData, null, 2)};`;

  const filePath = path.join(process.cwd(), 'lib', 'constants', 'sportsRollbotsNFTs.ts');
  await fs.writeFile(filePath, fileContent);
  console.log('Updated sportsRollbotsNFTs.ts with metadata');
}

async function main() {
  try {
    // Create sports-rollbots directory if it doesn't exist
    const sportsRollbotsDir = path.join(process.cwd(), 'public', 'collections', 'sports-rollbots');
    await fs.mkdir(sportsRollbotsDir, { recursive: true });

    // Process tokens sequentially with delay
    for (const tokenId of TOKEN_IDS) {
      await downloadImage(tokenId.toString());
      // Add a delay between tokens to avoid rate limiting
      await sleep(2000); // 2 second delay between tokens
    }

    // Fetch NFT data for all tokens with retries
    const nfts = await Promise.all(
      TOKEN_IDS.map(async (tokenId) => {
        try {
          return await retryWithBackoff(() => 
            alchemy.nft.getNftMetadata(
              SPORTS_ROLLBOTS_ADDRESS,
              tokenId.toString(),
              { refreshCache: true }
            )
          ) as AlchemyNft;
        } catch (error) {
          console.error(`Failed to fetch metadata for token ${tokenId} after all retries:`, error);
          return null;
        }
      })
    );

    // Update sportsRollbotsNFTs.ts with metadata
    await updateSportsRollbotsFile(nfts.filter((nft): nft is AlchemyNft => nft !== null));
    console.log('Done!');
  } catch (error) {
    console.error('Script failed:', error);
  }
}

main(); 