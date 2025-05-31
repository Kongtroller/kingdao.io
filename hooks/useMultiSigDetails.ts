import { useQuery } from '@tanstack/react-query'
import { Alchemy, Network, OwnedNft, NftTokenType, FloorPriceMarketplace } from 'alchemy-sdk'
import { getProvider } from '../lib/web3/provider'
import { ethers } from 'ethers'
import { isLikelyScamToken } from '../lib/constants/scamTokens'
import { fetchEthPrice, fetchCoinGeckoPrice } from '../lib/utils/api'

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY,
  network: Network.ETH_MAINNET
})

interface NFTBalance {
  contractAddress: string
  tokenId: string
  name: string
  description: string | null
  tokenUri: string | null
  imageUrl: string | null
  floorPrice: number
  collectionName: string
}

interface TokenBalance {
  symbol: string
  balance: string
  usdValue: number
  address: string
}

interface MultiSigDetails {
  tokenBalances: TokenBalance[]
  nftList: NFTBalance[]
  totalUSDValue: number
}

// Minimum USD value to show a token (e.g., $1)
const MIN_USD_VALUE = 1

async function fetchMultiSigDetails(address: string): Promise<MultiSigDetails> {
  console.log('Fetching details for address:', address)
  try {
    // Fetch ETH balance
    const ethBalance = await alchemy.core.getBalance(address)
    const formattedEthBalance = ethers.utils.formatEther(ethBalance)
    
    // Get ETH price from Coingecko with retries and fallback
    const ethPrice = await fetchEthPrice()
    const ethValue = parseFloat(formattedEthBalance) * ethPrice

    // Only add ETH if balance is not zero
    let tokenBalances: TokenBalance[] = []
    if (parseFloat(formattedEthBalance) > 0) {
      tokenBalances.push({
        symbol: 'ETH',
        balance: formattedEthBalance,
        usdValue: ethValue,
        address: '0x0000000000000000000000000000000000000000'
      })
    }

    console.log('ETH balance:', {
      balance: formattedEthBalance,
      price: ethPrice,
      value: ethValue
    })

    // Fetch token balances
    const tokenBalancesResponse = await alchemy.core.getTokenBalances(address)
    console.log('Token balances response:', tokenBalancesResponse)
    
    const tokenBalancePromises = tokenBalancesResponse.tokenBalances
      .filter(balance => {
        // Filter out zero balances early
        const balanceNum = ethers.BigNumber.from(balance.tokenBalance || '0')
        return !balanceNum.isZero()
      })
      .map(async (balance) => {
        try {
          const metadata = await alchemy.core.getTokenMetadata(balance.contractAddress)
          const decimals = metadata.decimals || 18
          const formattedBalance = ethers.utils.formatUnits(balance.tokenBalance || '0', decimals)
          const numericBalance = parseFloat(formattedBalance)

          // Skip if balance is effectively zero
          if (numericBalance <= 0) {
            return null
          }

          // Skip if it's likely a scam token
          if (isLikelyScamToken(balance.contractAddress, metadata.symbol || '')) {
            console.log('Filtered scam token:', metadata.symbol, balance.contractAddress)
            return null
          }

          // Get USD price from Coingecko with fallback
          const usdPrice = await fetchCoinGeckoPrice(balance.contractAddress)
          const usdValue = numericBalance * usdPrice

          // Skip if USD value is too low
          if (usdValue < MIN_USD_VALUE) {
            return null
          }

          return {
            symbol: metadata.symbol || 'Unknown',
            balance: formattedBalance,
            usdValue,
            address: balance.contractAddress
          }
        } catch (error) {
          console.error('Error processing token balance:', error)
          return null
        }
      })

    // Fetch NFTs
    const nftsResponse = await alchemy.nft.getNftsForOwner(address)
    console.log('NFTs response:', nftsResponse)
    
    const nftPromises = nftsResponse.ownedNfts.map(async (nft) => {
      let floorPrice = 0
      try {
        const floorPriceResponse = await alchemy.nft.getFloorPrice(nft.contract.address)
        if ('openSea' in floorPriceResponse && floorPriceResponse.openSea) {
          const openSeaData = floorPriceResponse.openSea as { floorPrice?: number }
          floorPrice = openSeaData.floorPrice || 0
        }
      } catch (error) {
        console.error('Error fetching floor price:', error)
      }

      let imageUrl = null
      if ('media' in nft && Array.isArray(nft.media) && nft.media.length > 0) {
        imageUrl = nft.media[0].gateway || null
      }
      
      return {
        contractAddress: nft.contract.address,
        tokenId: nft.tokenId,
        name: nft.contract.name || 'Unnamed NFT',
        description: nft.description,
        tokenUri: typeof nft.tokenUri === 'string' ? nft.tokenUri : null,
        imageUrl,
        floorPrice,
        collectionName: nft.contract.name || 'Unknown Collection'
      }
    })

    // Wait for all promises with error handling
    const tokenResults = await Promise.all(
      tokenBalancePromises.map(p => p.catch(() => null))
    )

    // Filter out null results and add to existing token balances
    tokenBalances = [
      ...tokenBalances,
      ...tokenResults.filter((token): token is TokenBalance => token !== null)
    ]

    // Sort tokens by USD value
    tokenBalances.sort((a, b) => b.usdValue - a.usdValue)

    const nftList = await Promise.all(
      nftPromises.map(p => p.catch(error => {
        console.error('Error in NFT promise:', error)
        return {
          contractAddress: '',
          tokenId: '',
          name: 'Error',
          description: null,
          tokenUri: null,
          imageUrl: null,
          floorPrice: 0,
          collectionName: 'Error'
        }
      }))
    )

    // Calculate total USD value
    const tokenValue = tokenBalances.reduce((sum, token) => sum + token.usdValue, 0)
    const nftValue = nftList.reduce((sum, nft) => sum + nft.floorPrice, 0)
    const totalValue = tokenValue + nftValue

    console.log('Fetched details for address:', address, {
      tokenBalances: tokenBalances.length,
      nftList: nftList.length,
      totalValue
    })

    return {
      tokenBalances,
      nftList,
      totalUSDValue: totalValue
    }
  } catch (error) {
    console.error('Error fetching details for address:', address, error)
    // Return a safe fallback value instead of throwing
    return {
      tokenBalances: [],
      nftList: [],
      totalUSDValue: 0
    }
  }
}

export function useMultiSigDetails(address: string) {
  return useQuery({
    queryKey: ['multiSig', address],
    queryFn: () => fetchMultiSigDetails(address),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// Hook to get all multisig details
export function useAllMultiSigDetails(addresses: string[]) {
  return useQuery({
    queryKey: ['allMultiSigs', addresses],
    queryFn: async () => {
      const details = await Promise.all(
        addresses.map(address => fetchMultiSigDetails(address))
      )
      return details
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
} 