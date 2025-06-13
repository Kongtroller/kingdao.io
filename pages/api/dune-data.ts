import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// Cache mechanism
const cache = {
  data: null as any,
  lastUpdate: 0
}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Alchemy API setup
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_KEY
const ALCHEMY_BASE_URL = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}`

async function fetchFloorPrice(contractAddress: string) {
  try {
    const response = await fetch(
      `${ALCHEMY_BASE_URL}/getFloorPrice?contractAddress=${contractAddress}`
    )
    const data = await response.json()
    return data.openSea?.floorPrice || 0
  } catch (error) {
    console.error('Failed to fetch floor price:', error)
    return 0
  }
}

async function fetchTokenPrices() {
  try {
    // Using CoinGecko API for token prices
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,tether,wrapped-ethereum&vs_currencies=usd'
    )
    const data = await response.json()
    
    return {
      ETH: data.ethereum?.usd || 0,
      USDC: data['usd-coin']?.usd || 1,
      USDT: data.tether?.usd || 1,
      WETH: data['wrapped-ethereum']?.usd || 0
    }
  } catch (error) {
    console.error('Failed to fetch token prices:', error)
    return {
      ETH: 0,
      USDC: 1,
      USDT: 1,
      WETH: 0
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check cache
    const now = Date.now()
    if (cache.data && now - cache.lastUpdate < CACHE_TTL) {
      return res.status(200).json(cache.data)
    }

    // Fetch fresh data
    const [kongFloorPrice, tokenPrices] = await Promise.all([
      fetchFloorPrice(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''),
      fetchTokenPrices()
    ])

    const data = {
      kong: {
        floorPrice: kongFloorPrice
      },
      tokens: {
        prices: tokenPrices
      },
      wallet: {
        value: 0 // This will be updated with actual wallet value calculation
      },
      history: [], // This will be populated with historical data
      recentSales: [], // This will be populated with recent sales data
      lastUpdate: new Date().toISOString()
    }

    // Update cache
    cache.data = { data }
    cache.lastUpdate = now

    res.status(200).json(cache.data)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
} 