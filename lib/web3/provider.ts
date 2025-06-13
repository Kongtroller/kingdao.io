import { ethers } from 'ethers'
import { Alchemy, Network } from 'alchemy-sdk'

// Initialize Alchemy SDK
export const alchemy = new Alchemy({
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY,
  network: Network.ETH_MAINNET
})

let provider: ethers.providers.JsonRpcProvider | null = null

export function getProvider(): ethers.providers.JsonRpcProvider {
  if (!provider) {
    // Use Alchemy provider for production
    if (process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY) {
      provider = new ethers.providers.AlchemyProvider(
        'mainnet',
        process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY
      )
    } else {
      // Fallback to Infura or public RPC
      provider = new ethers.providers.JsonRpcProvider(
        'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
      )
    }
  }
  return provider
}

export function getStaticProvider() {
  return new ethers.providers.StaticJsonRpcProvider(
    'https://eth-mainnet.g.alchemy.com/v2/' + process.env.NEXT_PUBLIC_ALCHEMY_RPC_API_KEY,
    'mainnet'
  )
}

export async function getENSName(address: string): Promise<string | null> {
  try {
    const provider = getProvider()
    const name = await provider.lookupAddress(address)
    return name
  } catch (error) {
    console.error('Error resolving ENS name:', error)
    return null
  }
}

export async function getENSAvatar(address: string): Promise<string | null> {
  try {
    const provider = getProvider()
    const avatar = await provider.getAvatar(address)
    return avatar
  } catch (error) {
    console.error('Error fetching ENS avatar:', error)
    return null
  }
} 