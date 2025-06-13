import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';
import { MANUAL_ROLLBOTS, ROLLBOTS_ADDRESS } from '../lib/constants/rollbotsNFTs';

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY,
  network: Network.ETH_MAINNET
});

export interface NFT {
  tokenId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  traits: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface NFTCollection {
  name: string;
  address: string;
  holdings: Array<{
    wallet: string;
    balance: number;
    nfts: NFT[];
  }>;
  floorPrice: number;
  totalValue: number;
}

export async function getNFTPortfolioData(walletAddresses: string[], provider: ethers.providers.Provider): Promise<Record<string, NFTCollection>> {
  const collections: Record<string, NFTCollection> = {};

  // Add manual Rollbots data
  collections[ROLLBOTS_ADDRESS.toLowerCase()] = {
    name: 'Rollbots',
    address: ROLLBOTS_ADDRESS.toLowerCase(),
    holdings: [{
      wallet: walletAddresses[0], // Assign to first wallet
      balance: MANUAL_ROLLBOTS.length,
      nfts: MANUAL_ROLLBOTS.map(nft => ({
        tokenId: nft.tokenId,
        name: nft.name,
        description: nft.description,
        imageUrl: nft.imageUrl,
        traits: nft.traits
      }))
    }],
    floorPrice: 0.5, // Set your desired floor price in ETH
    totalValue: 0 // Will be calculated below
  };

  // Fetch other NFTs
  for (const wallet of walletAddresses) {
    try {
      const nftsResponse = await alchemy.nft.getNftsForOwner(wallet);
      
      for (const nft of nftsResponse.ownedNfts) {
        const collectionAddress = nft.contract.address.toLowerCase();
        
        // Skip Rollbots as we're using manual data
        if (collectionAddress === ROLLBOTS_ADDRESS.toLowerCase()) {
          continue;
        }
        
        // Initialize collection if not exists
        if (!collections[collectionAddress]) {
          let floorPrice = 0;
          try {
            const floorPriceResponse = await alchemy.nft.getFloorPrice(nft.contract.address);
            if ('openSea' in floorPriceResponse && floorPriceResponse.openSea) {
              const openSeaData = floorPriceResponse.openSea as { floorPrice?: number };
              floorPrice = openSeaData.floorPrice || 0;
            }
          } catch (error) {
            console.error('Error fetching floor price:', error);
          }

          collections[collectionAddress] = {
            name: nft.contract.name || 'Unknown Collection',
            address: collectionAddress,
            holdings: [],
            floorPrice,
            totalValue: 0
          };
        }

        // Find or create holding for this wallet
        let holding = collections[collectionAddress].holdings.find(h => h.wallet === wallet);
        if (!holding) {
          holding = {
            wallet,
            balance: 0,
            nfts: []
          };
          collections[collectionAddress].holdings.push(holding);
        }

        // Add NFT to holding
        let imageUrl = null;
        if ('media' in nft && Array.isArray(nft.media) && nft.media.length > 0) {
          imageUrl = nft.media[0].gateway || null;
        }

        holding.nfts.push({
          tokenId: nft.tokenId,
          name: nft.rawMetadata?.name || `#${nft.tokenId}`,
          description: nft.description,
          imageUrl,
          traits: (nft.rawMetadata?.attributes as Array<{ trait_type: string; value: string }>) || []
        });

        holding.balance++;
      }
    } catch (error) {
      console.error(`Error fetching NFTs for wallet ${wallet}:`, error);
    }
  }

  // Calculate total values
  for (const collection of Object.values(collections)) {
    collection.totalValue = collection.floorPrice * collection.holdings.reduce(
      (sum, holding) => sum + holding.balance,
      0
    );
  }

  return collections;
} 