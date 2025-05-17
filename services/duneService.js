const DUNE_API_BASE = 'https://api.dune.com/api/v1'

// Configuration
const config = {
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    cleanupInterval: 15 * 60 * 1000, // 15 minutes
    maxSize: 100 // Maximum number of cached items
  },
  rateLimit: {
    wait: 10000, // 10 seconds between requests
    maxRetries: 1, // Only retry once
    retryDelay: 5000 // 5 seconds between retries
  },
  endpoints: {
    KONG_FLOOR_PRICE: {
      namespace: 'king_wizards',
      name: 'kongfloorprice',
      limit: 100,
      apiKey: process.env.DUNE_NFT_FLOOR_PRICE_API
    },
    TOKEN_PRICES: {
      namespace: 'king_wizards',
      name: 'tokenprices',
      limit: 100,
      apiKey: process.env.DUNE_NFT_TOKEN_PRICES_API
    },
    WALLET_BALANCES: {
      namespace: 'king_wizards',
      name: 'multisigvalue',
      limit: 100,
      apiKey: process.env.DUNE_WALLET_BALANCES_API
    }
  }
}

// Cache management
const cache = new Map()
let lastCleanup = Date.now()
let lastCallTimes = new Map() // Track last call time per endpoint

function cleanupCache() {
  const now = Date.now()
  if (now - lastCleanup < config.cache.cleanupInterval) return

  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > config.cache.ttl) {
      cache.delete(key)
    }
  }

  // If still over max size, remove oldest entries
  if (cache.size > config.cache.maxSize) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    const toDelete = entries.slice(0, entries.length - config.cache.maxSize)
    toDelete.forEach(([key]) => cache.delete(key))
  }

  lastCleanup = now
}

// Rate limiting
async function throttledFetch(url, options, endpointKey, retryCount = 0) {
  const now = Date.now()
  const lastCallTime = lastCallTimes.get(endpointKey) || 0
  const timeSinceLastCall = now - lastCallTime
  
  if (timeSinceLastCall < config.rateLimit.wait) {
    // If we've called too recently, return cached data or null
    const cached = cache.get(endpointKey)
    if (cached) {
      console.log(`Rate limited, returning cached data from ${new Date(cached.timestamp).toISOString()}`)
      return cached.data
    }
    return null
  }
  
  try {
    lastCallTimes.set(endpointKey, now)
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const error = await response.json()
      
      // Only retry on server errors, not on client errors (like 404)
      if (response.status >= 500 && retryCount < config.rateLimit.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, config.rateLimit.retryDelay))
        return throttledFetch(url, options, endpointKey, retryCount + 1)
      }
      
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    
    return response
  } catch (error) {
    if (retryCount < config.rateLimit.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, config.rateLimit.retryDelay))
      return throttledFetch(url, options, endpointKey, retryCount + 1)
    }
    throw error
  }
}

async function getDuneCustomEndpointResult(namespace, name, apiKey, limit = 100) {
  if (!namespace || !name || !apiKey) {
    console.error('Missing required configuration:', {
      hasNamespace: !!namespace,
      hasName: !!name,
      hasApiKey: !!apiKey
    })
    return null
  }

  const cacheKey = `${namespace}:${name}`
  cleanupCache()

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < config.cache.ttl) {
    return cached.data
  }

  try {
    const response = await throttledFetch(
      `${DUNE_API_BASE}/query/results/${name}?api_key=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      },
      cacheKey
    )
    
    if (!response) {
      // If throttledFetch returns null due to rate limiting, return cached data or null
      return cached?.data || null
    }

    const data = await response.json()
    
    if (!data.result?.rows) {
      throw new Error('Invalid response format from Dune API')
    }

    // Cache successful response
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error('Failed to fetch Dune custom endpoint:', error)
    return cached?.data || null
  }
}

export async function getKongFloorPrice() {
  const { namespace, name, limit, apiKey } = config.endpoints.KONG_FLOOR_PRICE
  const results = await getDuneCustomEndpointResult(namespace, name, apiKey, limit)
  
  if (!results?.result?.rows?.length) {
    return null
  }

  const latestData = results.result.rows[0]
  return {
    floorPrice: latestData.floor_price || 0,
    lastUpdate: latestData.timestamp || new Date().toISOString(),
    currency: 'ETH'
  }
}

export async function getTokenPrices() {
  const { namespace, name, limit, apiKey } = config.endpoints.TOKEN_PRICES
  const results = await getDuneCustomEndpointResult(namespace, name, apiKey, limit)
  
  if (!results?.result?.rows?.length) {
    return null
  }

  const latestData = results.result.rows[0]
  return {
    prices: latestData.prices || {},
    lastUpdate: latestData.timestamp || new Date().toISOString()
  }
}

export async function getWalletBalances() {
  const { namespace, name, limit, apiKey } = config.endpoints.WALLET_BALANCES
  const results = await getDuneCustomEndpointResult(namespace, name, apiKey, limit)
  
  if (!results?.result?.rows?.length) {
    return null
  }

  const latestData = results.result.rows[0]
  return {
    value: latestData.value || 0,
    lastUpdate: latestData.timestamp || new Date().toISOString(),
    currency: 'ETH'
  }
}

export async function getAllDuneData() {
  try {
    const [kongFloorPrice, tokenPrices, walletBalances] = await Promise.all([
      getKongFloorPrice(),
      getTokenPrices(),
      getWalletBalances()
    ])

    return {
      kong: kongFloorPrice,
      tokens: tokenPrices,
      wallet: walletBalances,
      lastUpdate: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to fetch Dune data:', error)
    return {
      kong: null,
      tokens: null,
      wallet: null,
      lastUpdate: new Date().toISOString(),
      error: error.message
    }
  }
} 