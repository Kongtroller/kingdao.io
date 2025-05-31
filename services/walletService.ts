import { alchemy } from '../lib/web3/provider'
import { getTokenPrices, getFallbackPrice } from './priceService'
import { TOKEN_ADDRESSES, TokenSymbol } from '../lib/daoWallets'
import { ethers } from 'ethers'

interface TokenBalance {
  symbol: string
  balance: string
  usdValue: number
  address: string
}

interface WalletBalance {
  address: string
  tokenBalances: TokenBalance[]
  totalValue: number
  error?: string
}

const EMPTY_BALANCE: WalletBalance = {
  address: '',
  tokenBalances: [],
  totalValue: 0
}

export async function getWalletBalances(address: string | null): Promise<WalletBalance> {
  if (!address) {
    return EMPTY_BALANCE
  }

  try {
    // Get token balances from Alchemy
    const response = await alchemy.core.getTokenBalances(address)

    // Get token metadata and format balances
    const balancesWithMetadata = await Promise.all(
      response.tokenBalances.map(async (token) => {
        try {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress)
          const decimals = metadata.decimals || 18
          const formattedBalance = ethers.utils.formatUnits(token.tokenBalance || '0', decimals)

          return {
            symbol: metadata.symbol || 'Unknown',
            balance: formattedBalance,
            address: token.contractAddress,
            usdValue: 0 // Will be updated with price data
          }
        } catch (error) {
          console.warn(`Failed to fetch metadata for token ${token.contractAddress}:`, error)
          return null
        }
      })
    )

    // Filter out failed token fetches
    const validBalances = balancesWithMetadata.filter((b): b is TokenBalance => b !== null)

    // Get prices for all tokens
    const tokenAddresses = validBalances.map(b => b.address)
    const prices = await getTokenPrices(tokenAddresses)

    // Calculate USD values
    const balancesWithPrices = validBalances.map(balance => ({
      ...balance,
      usdValue: parseFloat(balance.balance) * (prices[balance.address] || getFallbackPrice(balance.symbol as TokenSymbol))
    }))

    const totalValue = balancesWithPrices.reduce((sum, b) => sum + b.usdValue, 0)

    return {
      address,
      tokenBalances: balancesWithPrices,
      totalValue
    }
  } catch (error) {
    console.error('Failed to fetch wallet balances:', error)
    return {
      ...EMPTY_BALANCE,
      address,
      error: 'Failed to fetch wallet balances'
    }
  }
}

export async function getMultiSigBalances(addresses: string[]): Promise<WalletBalance[]> {
  try {
    const balances = await Promise.all(
      addresses.map(address => getWalletBalances(address))
    )
    return balances
  } catch (error) {
    console.error('Failed to fetch multisig balances:', error)
    return addresses.map(address => ({
      ...EMPTY_BALANCE,
      address,
      error: 'Failed to fetch balances'
    }))
  }
} 