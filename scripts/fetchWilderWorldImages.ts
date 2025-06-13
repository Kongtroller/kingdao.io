import { Alchemy, Network } from 'alchemy-sdk';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { WilderWorldNFT } from '../lib/constants/wilderWorldNFTs';

// Token IDs from the provided OpenSea URLs
const TOKEN_IDS = [
  '37263806078148289478045292319502245359893571831903681984357324168914675299015',
  '113652907629653379513608309898474441837064767872071027020241819776297838090715',
  '36073522002736318236441335305922097439592256555061637376927927329956085869960'
];

const CONTRACT_ADDRESS = '0xc2e9678A71e50E5AEd036e00e9c5caeb1aC5987D';

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

// IPFS gateways in order of preference
const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.eth.aragon.network/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://cf-ipfs.com/ipfs/',
  'https://ipfs.fleek.co/ipfs/',
  'https://ipfs.infura.io/ipfs/',
  'https://ipfs.eternum.io/ipfs/',
  'https://hardbin.com/ipfs/',
  'https://gateway.ravenland.org/ipfs/',
  'https://ipfs.yt/ipfs/'
];

function getBackoffTime(attempt: number, minMs = 1000, maxMs = 10000) {
  // Calculate exponential backoff
  const expBackoff = Math.min(maxMs, minMs * Math.pow(2, attempt));
  
  // Add random jitter (±30% of the backoff time)
  const jitter = expBackoff * 0.3 * (Math.random() * 2 - 1);
  
  return Math.floor(expBackoff + jitter);
}

async function getOpenSeaAssetUrl(tokenId: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://api.opensea.io/api/v1/asset/${CONTRACT_ADDRESS}/${tokenId}`,
      {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY || ''
        }
      }
    );

    if (response.data?.animation_url || response.data?.image_url) {
      return response.data.animation_url || response.data.image_url;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch from OpenSea:', error);
    return null;
  }
}

async function downloadMedia(url: string, tokenId: string, mediaType: 'video' | 'image') {
  let lastError;
  const extension = mediaType === 'video' ? 'mp4' : 'png';
  const maxRetries = 2;

  // If it's an IPFS URL, try multiple gateways
  if (url.startsWith('ipfs://')) {
    const hash = url.slice(7);
    
    for (const gateway of IPFS_GATEWAYS) {
      try {
        const gatewayUrl = `${gateway}${hash}`;
        console.log(`🔄 Trying gateway: ${gateway} for token #${tokenId}`);
        
        const response = await axios({
          url: gatewayUrl,
          responseType: 'arraybuffer',
          timeout: 120000, // 120 second timeout for larger files
          headers: {
            'Accept': mediaType === 'video' ? 'video/mp4,video/*' : 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        });

        const outputDir = path.join(process.cwd(), 'public', 'collections', 'wilder-world');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${tokenId}.${extension}`);
        fs.writeFileSync(outputPath, response.data);
        console.log(`✅ Successfully downloaded media for token #${tokenId}`);
        return;
      } catch (error) {
        lastError = error;
        console.log(`⚠️ Gateway ${gateway} failed for token #${tokenId}: ${error.message}`);
        
        // Add a delay between gateways
        const gatewayBackoffTime = getBackoffTime(1);
        console.log(`⏳ Gateway failed, waiting ${gatewayBackoffTime}ms before trying next gateway...`);
        await new Promise(resolve => setTimeout(resolve, gatewayBackoffTime));
      }
    }
    throw lastError;
  } else {
    // For non-IPFS URLs, try direct download with retries
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        console.log(`🔄 Attempting to download media from URL: ${url} (attempt ${retry + 1}/${maxRetries})`);
        
        const response = await axios({
          url,
          responseType: 'arraybuffer',
          timeout: 120000,
          headers: {
            'Accept': mediaType === 'video' ? 'video/mp4,video/*' : 'image/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        });

        const outputDir = path.join(process.cwd(), 'public', 'collections', 'wilder-world');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputPath = path.join(outputDir, `${tokenId}.${extension}`);
        fs.writeFileSync(outputPath, response.data);
        console.log(`✅ Successfully downloaded media for token #${tokenId}`);
        return;
      } catch (error) {
        lastError = error;
        console.log(`⚠️ Download failed for token #${tokenId} (attempt ${retry + 1}/${maxRetries}): ${error.message}`);
        
        if (retry < maxRetries - 1) {
          const backoffTime = getBackoffTime(retry);
          console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }
    throw lastError;
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

async function fetchNFTs() {
  console.log('🚀 Starting to fetch Wilder World NFTs...');

  const nftsData = [];
  const failedTokens = [];
  let existingData = [];

  // Try to load existing data
  const dataPath = path.join(process.cwd(), 'lib', 'constants', 'wilderWorldNFTs.ts');
  if (fs.existsSync(dataPath)) {
    try {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      const match = fileContent.match(/export const MANUAL_WILDER_WORLD: WilderWorldNFT\[] = (\[[\s\S]*?\]) as const;/);
      if (match) {
        existingData = JSON.parse(match[1]);
        console.log(`📦 Found existing data for ${existingData.length} NFTs`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse existing data:', error);
    }
  }

  // Determine which tokens to fetch
  const tokenIdsToFetch = TOKEN_IDS.filter(id => 
    !existingData.some((nft: WilderWorldNFT) => nft.tokenId === id)
  );

  if (tokenIdsToFetch.length === 0) {
    console.log('✨ All NFTs already fetched!');
    return;
  }

  console.log(`🎯 Fetching ${tokenIdsToFetch.length} new NFTs...`);

  for (const tokenId of tokenIdsToFetch) {
    let success = false;
    let attempts = 0;
    const maxAttempts = 2;

    while (!success && attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`\n📥 Fetching metadata for token #${tokenId}... (Attempt ${attempts}/${maxAttempts})`);
        
        const nft = await alchemy.nft.getNftMetadata(
          CONTRACT_ADDRESS,
          tokenId
        );

        console.log('Raw metadata:', JSON.stringify(nft.raw, null, 2));

        let mediaUrl = nft.raw.metadata?.animation_url || nft.raw.metadata?.image;
        let mediaType: 'video' | 'image' = nft.raw.metadata?.animation_url ? 'video' : 'image';
        
        if (!mediaUrl && nft.raw.tokenUri) {
          console.log(`🔍 Fetching metadata from token URI: ${nft.raw.tokenUri}`);
          const metadata = await fetchMetadataFromUri(nft.raw.tokenUri);
          mediaUrl = metadata?.animation_url || metadata?.image;
          mediaType = metadata?.animation_url ? 'video' : 'image';
        }

        // If IPFS URL, try to get direct URL from OpenSea
        if (mediaUrl && mediaUrl.startsWith('ipfs://')) {
          console.log('🔍 Trying to get direct URL from OpenSea...');
          const openSeaUrl = await getOpenSeaAssetUrl(tokenId);
          if (openSeaUrl) {
            console.log('✅ Got direct URL from OpenSea');
            mediaUrl = openSeaUrl;
          }
        }

        if (mediaUrl) {
          await downloadMedia(mediaUrl, tokenId, mediaType);
          
          // Verify the file was downloaded
          const extension = mediaType === 'video' ? 'mp4' : 'png';
          const filePath = path.join(process.cwd(), 'public', 'collections', 'wilder-world', `${tokenId}.${extension}`);
          
          if (fs.existsSync(filePath)) {
            // Save NFT data only if file exists
            nftsData.push({
              tokenId,
              name: nft.raw.metadata?.name || `Wilder World #${tokenId}`,
              description: nft.raw.metadata?.description,
              mediaUrl: `/collections/wilder-world/${tokenId}.${extension}`,
              mediaType,
              traits: nft.raw.metadata?.attributes || []
            });
            success = true;
            console.log(`✅ Successfully processed token #${tokenId}`);
          } else {
            throw new Error('File download verification failed');
          }
        } else {
          throw new Error('No media URL found');
        }

        // Add a delay between tokens
        if (!success && attempts < maxAttempts) {
          const backoffTime = getBackoffTime(attempts - 1);
          console.log(`⏳ Waiting ${backoffTime}ms before retrying token #${tokenId}...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      } catch (error) {
        console.error(`❌ Failed to process token #${tokenId} (Attempt ${attempts}/${maxAttempts}):`, error.message);
        
        if (attempts >= maxAttempts) {
          failedTokens.push(tokenId);
          console.error(`❌ All attempts failed for token #${tokenId}`);
        }
      }
    }
  }

  if (failedTokens.length > 0) {
    console.error('\n⚠️ Failed to fetch the following tokens:', failedTokens);
  }

  // Combine new and existing data
  const allNftsData = [...existingData, ...nftsData];

  if (allNftsData.length === 0) {
    console.error('❌ No NFTs were successfully fetched. Aborting.');
    process.exit(1);
  }

  // Save NFT data to a JSON file
  const outputDir = path.join(process.cwd(), 'lib', 'constants');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, 'wilderWorldNFTs.ts'),
    `import { Trait } from '@/types/nft';

export interface WilderWorldNFT {
  tokenId: string;
  name: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  traits: Trait[];
}

export const MANUAL_WILDER_WORLD: WilderWorldNFT[] = ${JSON.stringify(allNftsData, null, 2)} as const;

export const WILDER_WORLD_ADDRESS = '${CONTRACT_ADDRESS}';`
  );

  console.log(`\n✨ Finished fetching NFTs! Successfully fetched ${nftsData.length} new NFTs.`);
  console.log(`📊 Total NFTs: ${allNftsData.length}/${TOKEN_IDS.length}`);
  
  if (allNftsData.length < TOKEN_IDS.length) {
    process.exit(1);
  }
}

// Run the script
fetchNFTs().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 