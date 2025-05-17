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

export async function getMultiSigBalances(provider) {
  try {
    const balances = {}
    const addresses = Object.values(MULTISIG_ADDRESSES)
    const tokenPrices = await getTokenPrices()
    const walletBalances = await getWalletBalances(addresses)
    
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

      // Get token balances from Dune
      const duneBalances = walletBalances[address.toLowerCase()]?.tokens || []

      balances[name] = {
        address,
        ethBalance: ethers.utils.formatEther(ethBalance),
        ethPrice: tokenPrices['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2']?.price || 0, // WETH address
        owners,
        threshold,
        tokens: duneBalances
      }
    }

    return balances
  } catch (error) {
    console.error('Failed to fetch multi-sig balances:', error)
    return null
  }
}

// Function to get ERC20 token balances is no longer needed as we're using Dune data 