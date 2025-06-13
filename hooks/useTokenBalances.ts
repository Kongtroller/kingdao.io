import { useQuery } from '@tanstack/react-query'
import { alchemy } from '../lib/web3/provider'
import { ethers } from 'ethers'

interface TokenBalance {
  contractAddress: string
  symbol: string
  balance: string
  decimals: number
  usdValue: number
  logo?: string
}

export function useTokenBalances(address: string, tokenAddresses?: string[]) {
  return useQuery({
    queryKey: ['tokenBalances', address, tokenAddresses],
    queryFn: async () => {
      try {
        const response = await alchemy.core.getTokenBalances(address, tokenAddresses)

        const balancesWithMetadata = await Promise.all(
          response.tokenBalances.map(async (token) => {
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
            const decimals = metadata.decimals || 18
            const formattedBalance = ethers.utils.formatUnits(token.tokenBalance || '0', decimals)

            // Get USD price from Coingecko
            const priceResponse = await fetch(
              `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${token.contractAddress}&vs_currencies=usd`
            )
            const priceData = await priceResponse.json()
            const usdPrice = priceData[token.contractAddress.toLowerCase()]?.usd || 0

            return {
              contractAddress: token.contractAddress,
              symbol: metadata.symbol || 'Unknown',
              balance: formattedBalance,
              decimals,
              usdValue: parseFloat(formattedBalance) * usdPrice,
              logo: metadata.logo
            }
          })
        )

        return balancesWithMetadata
      } catch (error) {
        console.error('Error fetching token balances:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
} 