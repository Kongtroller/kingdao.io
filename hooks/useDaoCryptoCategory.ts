import { useQuery } from '@tanstack/react-query'
import { ethers } from 'ethers'
import { getProvider } from '../lib/web3/provider'
import { DAO_WALLETS, TOKEN_CATEGORIES, TOKEN_ADDRESSES, TokenCategory } from '../lib/daoWallets'
import { Alchemy, Network } from 'alchemy-sdk'

const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
  network: Network.ETH_MAINNET
})

interface TokenBalance {
  symbol: string
  totalBalance: string
  usdValue: number
  iconUrl: string
}

async function fetchTokenBalances(category: TokenCategory): Promise<TokenBalance[]> {
  const provider = getProvider()
  const walletAddresses = Object.values(DAO_WALLETS)
  const tokensInCategory = TOKEN_CATEGORIES[category]
  const tokenAddresses = tokensInCategory.map(symbol => TOKEN_ADDRESSES[symbol])

  // Fetch balances for all wallets
  const balancePromises = walletAddresses.map(async (address) => {
    const response = await alchemy.core.getTokenBalances(address, tokenAddresses)
    return response.tokenBalances
  })

  const allBalances = await Promise.all(balancePromises)

  // Fetch token metadata and prices
  const tokenDataPromises = tokensInCategory.map(async (symbol, index) => {
    const address = TOKEN_ADDRESSES[symbol]
    let totalBalance = ethers.BigNumber.from(0)

    // Sum balances across all wallets
    allBalances.forEach(walletBalances => {
      const balance = walletBalances[index]?.tokenBalance || '0'
      totalBalance = totalBalance.add(balance)
    })

    // Get token metadata
    const metadata = await alchemy.core.getTokenMetadata(address)
    const decimals = metadata.decimals || 18

    // Format balance
    const formattedBalance = ethers.utils.formatUnits(totalBalance, decimals)

    // Get USD price from Coingecko (you might want to use a different price feed)
    const priceResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`
    )
    const priceData = await priceResponse.json()
    const usdPrice = priceData[address.toLowerCase()]?.usd || 0

    return {
      symbol,
      totalBalance: formattedBalance,
      usdValue: parseFloat(formattedBalance) * usdPrice,
      iconUrl: metadata.logo || '' // Alchemy provides token logos
    }
  })

  return Promise.all(tokenDataPromises)
}

export function useDaoCryptoCategory(category: TokenCategory) {
  return useQuery({
    queryKey: ['daoCrypto', category],
    queryFn: () => fetchTokenBalances(category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// Hook to get total value across all categories
export function useDaoCryptoTotal() {
  return useQuery({
    queryKey: ['daoCryptoTotal'],
    queryFn: async () => {
      const categories = Object.keys(TOKEN_CATEGORIES) as TokenCategory[]
      const categoryBalances = await Promise.all(
        categories.map(category => fetchTokenBalances(category))
      )

      const total = categoryBalances.reduce((sum, tokens) => {
        return sum + tokens.reduce((catSum, token) => catSum + token.usdValue, 0)
      }, 0)

      return total
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  })
} 