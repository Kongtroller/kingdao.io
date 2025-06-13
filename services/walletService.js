import { ethers } from 'ethers'
import { getTokenPrices, getWalletBalances } from './priceService'
import { getProvider } from '../lib/web3/provider'

// ERC20 ABI (minimal for balance checking)
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
]

// Common ERC20 tokens to check
const COMMON_TOKENS = [
  {
    symbol: 'USDC',
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6
  },
  {
    symbol: 'USDT',
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  },
  {
    symbol: 'WETH',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    decimals: 18
  }
  // Add more tokens as needed
]

// Gnosis Safe ABI (minimal for balance checking)
const SAFE_ABI = [
  'function getOwners() view returns (address[])',
  'function getThreshold() view returns (uint256)',
  'function isOwner(address owner) view returns (bool)'
]

// Known multi-sig addresses
export const MULTISIG_ADDRESSES = {
  'DAO Fund': '0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF',
  'Reward Wallet': '0x24901F1b9b41e853778107CD737cC426b456fC95',
  'IBW': '0x00239b99703b773B0A1B6A33f4691867aF071d5A',
  'DCAP Wallet': '0x7F40aD6ED8B9D510AF3BF31367E56CFeA3dc3d9C'
}

// Cache for wallet data
const walletCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getTokenBalances(walletAddress) {
  try {
    const cacheKey = `tokens_${walletAddress}`
    const now = Date.now()
    const provider = getProvider()

    // Check cache first
    const cached = walletCache.get(cacheKey)
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // Get token prices
    const tokenPrices = await getTokenPrices()

    // Get balances for each token
    const tokenPromises = COMMON_TOKENS.map(async (token) => {
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
      try {
        const balance = await contract.balanceOf(walletAddress)
        const formattedBalance = ethers.utils.formatUnits(balance, token.decimals)
        const price = tokenPrices[token.symbol] || 0

        return {
          symbol: token.symbol,
          address: token.address,
          balance: formattedBalance,
          price,
          value: parseFloat(formattedBalance) * price
        }
      } catch (err) {
        console.error(`Error fetching balance for ${token.symbol}:`, err)
        return null
      }
    })

    // Get ETH balance
    const ethBalancePromise = provider.getBalance(walletAddress).then(balance => {
      const formattedBalance = ethers.utils.formatEther(balance)
      const price = tokenPrices['ETH'] || 0
      return {
        symbol: 'ETH',
        address: 'native',
        balance: formattedBalance,
        price,
        value: parseFloat(formattedBalance) * price
      }
    })

    // Wait for all promises
    const results = await Promise.all([...tokenPromises, ethBalancePromise])
    const tokens = results.filter(Boolean) // Remove null results

    // Update cache
    walletCache.set(cacheKey, {
      data: tokens,
      timestamp: now
    })

    return tokens
  } catch (error) {
    console.error('Error fetching token balances:', error)
    // Return cached data if available
    const cached = walletCache.get(`tokens_${walletAddress}`)
    if (cached) {
      return cached.data
    }
    return []
  }
}

export async function getMultiSigBalances() {
  try {
    const now = Date.now()
    const addresses = Object.values(MULTISIG_ADDRESSES)
    const balances = {}
    const provider = getProvider()

    // Check cache first
    const cached = walletCache.get('balances')
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // Get token prices and wallet balances
    const [tokenPrices, walletBalance] = await Promise.all([
      getTokenPrices(),
      getWalletBalances()
    ])

    // Get on-chain data for each wallet
    await Promise.all(
      Object.entries(MULTISIG_ADDRESSES).map(async ([name, address]) => {
        try {
          // Get ETH balance
          const ethBalance = await provider.getBalance(address)
          
          // Create Safe contract instance
          const safeContract = new ethers.Contract(address, SAFE_ABI, provider)
          
          // Get Safe details
          const [owners, threshold] = await Promise.all([
            safeContract.getOwners(),
            safeContract.getThreshold()
          ])

          balances[name] = {
            address,
            ethBalance: ethers.utils.formatEther(ethBalance),
            totalValue: walletBalance,
            owners,
            threshold,
            lastUpdated: new Date().toISOString()
          }
        } catch (error) {
          // If there's an error, use cached data for this wallet if available
          if (cached?.data?.[name]) {
            balances[name] = cached.data[name]
          } else {
            balances[name] = {
              address,
              error: error.message,
              lastUpdated: new Date().toISOString()
            }
          }
        }
      })
    )

    // Update cache
    walletCache.set('balances', {
      data: balances,
      timestamp: now
    })

    return balances
  } catch (error) {
    // Return cached data if available
    const cached = walletCache.get('balances')
    if (cached) {
      return cached.data
    }
    throw error
  }
}

// Function to get ERC20 token balances is no longer needed as we're using Dune data 