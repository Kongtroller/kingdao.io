import { NextApiRequest, NextApiResponse } from 'next'

// Cache mechanism
const cache = {
  eth: { price: 0, timestamp: 0 },
  tokens: new Map<string, { price: number, timestamp: number }>()
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Fallback prices for major tokens
const FALLBACK_PRICES = {
  ETH: 2000,
  WETH: 2000,
  USDC: 1,
  USDT: 1,
  DAI: 1
}

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { type, address } = req.query

    // Return ETH price
    if (type === 'eth') {
      const now = Date.now()
      
      // Check cache
      if (now - cache.eth.timestamp < CACHE_TTL) {
        return res.json({ price: cache.eth.price })
      }

      try {
        const response = await fetchWithTimeout(
          `${COINGECKO_API}/simple/price?ids=ethereum&vs_currencies=usd`
        )
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const price = data.ethereum?.usd || FALLBACK_PRICES.ETH

        // Update cache
        cache.eth = { price, timestamp: now }
        
        return res.json({ price })
      } catch (error) {
        console.error('Failed to fetch ETH price:', error)
        return res.json({ price: FALLBACK_PRICES.ETH })
      }
    }

    // Return token price
    if (type === 'token' && address) {
      const now = Date.now()
      const tokenAddress = address.toString().toLowerCase()

      // Check cache
      const cached = cache.tokens.get(tokenAddress)
      if (cached && now - cached.timestamp < CACHE_TTL) {
        return res.json({ price: cached.price })
      }

      try {
        const response = await fetchWithTimeout(
          `${COINGECKO_API}/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const price = data[tokenAddress]?.usd || 0

        // Update cache
        cache.tokens.set(tokenAddress, { price, timestamp: now })

        return res.json({ price })
      } catch (error) {
        console.error(`Failed to fetch price for token ${tokenAddress}:`, error)
        return res.json({ price: 0 })
      }
    }

    return res.status(400).json({ error: 'Invalid request' })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 