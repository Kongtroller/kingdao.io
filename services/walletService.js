import { ethers } from 'ethers'
import { getTokenPrices, getWalletBalances } from './duneService'

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

export async function getMultiSigBalances(provider) {
  try {
    const now = Date.now()
    const addresses = Object.values(MULTISIG_ADDRESSES)
    const balances = {}

    // Check cache first
    const cached = walletCache.get('balances')
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data
    }

    // Get token prices and wallet balances from Dune
    const [tokenPrices, walletBalances] = await Promise.all([
      getTokenPrices(),
      getWalletBalances(addresses)
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

          // Get token balances from Dune
          const duneBalances = walletBalances[address.toLowerCase()]?.tokens || []

          balances[name] = {
            address,
            ethBalance: ethers.utils.formatEther(ethBalance),
            ethPrice: tokenPrices['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']?.price || 0,
            owners,
            threshold,
            tokens: duneBalances,
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