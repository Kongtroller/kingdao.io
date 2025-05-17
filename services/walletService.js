import { ethers } from 'ethers'

// Gnosis Safe ABI (minimal for balance checking)
const SAFE_ABI = [
  'function getOwners() view returns (address[])',
  'function getThreshold() view returns (uint256)',
  'function isOwner(address owner) view returns (bool)'
]

// Known multi-sig addresses
const MULTISIG_ADDRESSES = {
  'DAO Fund': '0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF', // Replace with actual treasury multi-sig address
  'Reward Wallet': '0x24901F1b9b41e853778107CD737cC426b456fC95', // Replace with actual investment multi-sig address
  'IBW': '0x00239b99703b773B0A1B6A33f4691867aF071d5A', // Replace with actual operations multi-sig address
  'DCAP Wallet': '0x7F40aD6ED8B9D510AF3BF31367E56CFeA3dc3d9C'
}

export async function getMultiSigBalances(provider) {
  try {
    const balances = {}
    
    for (const [name, address] of Object.entries(MULTISIG_ADDRESSES)) {
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
        owners,
        threshold,
        tokens: [] // Will be populated with ERC20 balances
      }
    }

    return balances
  } catch (error) {
    console.error('Failed to fetch multi-sig balances:', error)
    return null
  }
}

// Function to get ERC20 token balances
export async function getTokenBalances(address, provider) {
  const ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)'
  ]

  const TOKEN_ADDRESSES = {
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    // Add other tokens as needed
  }

  try {
    const balances = []
    
    for (const [symbol, tokenAddress] of Object.entries(TOKEN_ADDRESSES)) {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider)
      
      const [balance, decimals] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.decimals()
      ])

      balances.push({
        symbol,
        balance: ethers.utils.formatUnits(balance, decimals),
        address: tokenAddress
      })
    }

    return balances
  } catch (error) {
    console.error('Failed to fetch token balances:', error)
    return []
  }
} 