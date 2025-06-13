import { TokenSymbol } from '../lib/daoWallets'

interface TokenPrice {
  symbol: string
  usd: number
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Cache prices for 5 minutes
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(id)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

async function fetchTokenPrice(address: string): Promise<number> {
  // Check cache first
  const cached = priceCache.get(address)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price
  }

  try {
    const response = await fetchWithTimeout(
      `${COINGECKO_API_BASE}/simple/token_price/ethereum?contract_addresses=${address}&vs_currencies=usd`
    )
    const data = await response.json()
    const price = data[address.toLowerCase()]?.usd || 0

    // Update cache
    priceCache.set(address, { price, timestamp: Date.now() })
    return price
  } catch (error) {
    console.warn(`Failed to fetch price for token ${address}:`, error)
    // Return cached price if available, even if expired
    return cached?.price || 0
  }
}

export async function getTokenPrices(addresses: string[]): Promise<Record<string, number>> {
  try {
    // Fetch prices in batches of 50 to avoid rate limits
    const batchSize = 50
    const prices: Record<string, number> = {}

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      const batchPrices = await Promise.all(
        batch.map(address => fetchTokenPrice(address))
      )

      batch.forEach((address, index) => {
        prices[address] = batchPrices[index]
      })

      // Add a small delay between batches
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return prices
  } catch (error) {
    console.error('Failed to fetch token prices:', error)
    // Return empty prices rather than throwing
    return addresses.reduce((acc, address) => ({ ...acc, [address]: 0 }), {})
  }
}

// Fallback prices for major tokens when API fails
const FALLBACK_PRICES: Record<string, number> = {
  ETH: 2000,
  WETH: 2000,
  USDC: 1,
  USDT: 1,
  DAI: 1
}

export function getFallbackPrice(symbol: TokenSymbol): number {
  return FALLBACK_PRICES[symbol] || 0
} 