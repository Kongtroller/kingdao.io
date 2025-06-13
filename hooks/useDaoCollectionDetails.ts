import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { getDaoWalletAddresses } from '../lib/daoWallets';
import { getNFTPortfolioData, NFT } from '../services/nftPortfolioService';

interface NFTCollection {
  name: string;
  address: string;
  holdings: Array<{
    wallet: string;
    balance: number;
  }>;
  floorPrice: number;
  totalValue: number;
}

export interface CollectionDetails {
  totalNfts: number;
  floorPrice: number;
  totalValue: number;
  holdings: Array<{
    wallet: string;
    balance: number;
    nfts: NFT[];
  }>;
  isLoading: boolean;
  error: string | null;
}

export function useDaoCollectionDetails(contractAddress: string) {
  const publicClient = usePublicClient();
  const [details, setDetails] = useState<CollectionDetails>({
    totalNfts: 0,
    floorPrice: 0,
    totalValue: 0,
    holdings: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!publicClient || !contractAddress) return;

      try {
        const provider = new ethers.providers.Web3Provider(publicClient as any);
        const walletAddresses = getDaoWalletAddresses();
        
        // Use NFT portfolio service
        const portfolioData = await getNFTPortfolioData(walletAddresses, provider);
        
        // Find the collection data
        const collectionData = Object.values(portfolioData).find(
          collection => collection.address.toLowerCase() === contractAddress.toLowerCase()
        );

        if (collectionData) {
          const totalNfts = collectionData.holdings.reduce(
            (sum, holding) => sum + holding.balance,
            0
          );

          setDetails({
            totalNfts,
            floorPrice: collectionData.floorPrice || 0,
            totalValue: collectionData.totalValue || 0,
            holdings: collectionData.holdings,
            isLoading: false,
            error: null
          });
        } else {
          setDetails(prev => ({
            ...prev,
            isLoading: false,
            error: 'Collection not found in DAO wallets'
          }));
        }
      } catch (err) {
        console.error('Failed to fetch collection details:', err);
        setDetails(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to fetch collection details'
        }));
      }
    };

    if (contractAddress) {
      setDetails(prev => ({ ...prev, isLoading: true, error: null }));
      fetchDetails();
    }
  }, [publicClient, contractAddress]);

  return details;
} 