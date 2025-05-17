import fs from 'fs'
import path from 'path'

// Cache settings
const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'dune-data.json')
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes

// Validate environment variables
const requiredEnvVars = [
  'DUNE_API_KEY',
  'DUNE_FLOOR_PRICE_QUERY_ID',
  'DUNE_RECENT_SALES_QUERY_ID',
  'DUNE_WALLET_BALANCES_QUERY_ID',
  'DUNE_HISTORICAL_PRICES_QUERY_ID'
]

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// Add mock data for development
const MOCK_DATA = {
  kong: {
    floorPrice: 2.5,
    lastUpdate: new Date().toISOString()
  },
  tokens: {
    prices: {
      'KONG': 100,
      'ETH': 2000
    },
    lastUpdate: new Date().toISOString()
  },
  wallet: {
    value: 10.5,
    lastUpdate: new Date().toISOString()
  },
  history: Array.from({length: 30}, (_, i) => ({
    timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    price: 2.5 + Math.random() * 0.5
  })),
  recentSales: []
}

async function executeDuneQuery(queryId) {
  try {
    console.log(`Executing Dune query ${queryId}...`)
    // Execute query
    const executeResponse = await fetch(`https://api.dune.com/api/v1/query/${queryId}/execute`, {
      method: 'POST',
      headers: {
        'x-dune-api-key': process.env.DUNE_API_KEY
      }
    })

    if (!executeResponse.ok) {
      const errorText = await executeResponse.text()
      console.error(`Failed to execute query ${queryId}:`, errorText)
      throw new Error(`Failed to execute query: ${executeResponse.statusText}. ${errorText}`)
    }

    const executeData = await executeResponse.json()
    console.log(`Got execution ID for query ${queryId}:`, executeData.execution_id)
    const { execution_id } = executeData

    // Single retry with fixed delay
    const delay = 5000 // 5 second delay
    await new Promise(resolve => setTimeout(resolve, delay))

    // Check status
    console.log(`Checking status for execution ${execution_id}...`)
    const statusResponse = await fetch(`https://api.dune.com/api/v1/execution/${execution_id}/status`, {
      headers: {
        'x-dune-api-key': process.env.DUNE_API_KEY
      }
    })

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error(`Failed to check status for execution ${execution_id}:`, errorText)
      throw new Error(`Failed to check execution status: ${statusResponse.statusText}. ${errorText}`)
    }

    const { state, error } = await statusResponse.json()
    console.log(`Status for execution ${execution_id}:`, state)

    if (state === 'QUERY_STATE_COMPLETED') {
      // Get results
      console.log(`Fetching results for execution ${execution_id}...`)
      const resultsResponse = await fetch(`https://api.dune.com/api/v1/execution/${execution_id}/results`, {
        headers: {
          'x-dune-api-key': process.env.DUNE_API_KEY
        }
      })

      if (!resultsResponse.ok) {
        const errorText = await resultsResponse.text()
        console.error(`Failed to fetch results for execution ${execution_id}:`, errorText)
        throw new Error(`Failed to fetch results: ${resultsResponse.statusText}. ${errorText}`)
      }

      const results = await resultsResponse.json()
      console.log(`Got results for query ${queryId}:`, {
        rowCount: results.result?.rows?.length || 0,
        firstRow: results.result?.rows?.[0]
      })
      return results
    }

    if (state === 'QUERY_STATE_FAILED') {
      throw new Error(`Query execution failed: ${error || 'Unknown error'}`)
    }

    // For any other state, throw timeout error
    throw new Error(`Query timed out. Current state: ${state}`)

  } catch (error) {
    console.error('Dune API error:', error)
    throw error
  }
}

async function getCachedData() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
      if (Date.now() - cache.timestamp < CACHE_DURATION) {
        return cache
      }
    }
  } catch (error) {
    console.error('Cache read error:', error)
  }
  return null
}

async function setCachedData(data) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({
      timestamp: Date.now(),
      data
    }))
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check for missing environment variables
    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    if (missingVars.length > 0) {
      console.warn('Missing environment variables:', missingVars)
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data in development mode')
        return res.status(200).json({
          timestamp: Date.now(),
          data: MOCK_DATA,
          warning: 'Using mock data due to missing environment variables'
        })
      }
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }

    // Check cache first
    const cached = await getCachedData()
    if (cached) {
      console.log('Returning cached data')
      return res.status(200).json(cached)
    }

    console.log('Executing Dune queries with IDs:', {
      floorPrice: process.env.DUNE_FLOOR_PRICE_QUERY_ID,
      sales: process.env.DUNE_RECENT_SALES_QUERY_ID,
      wallet: process.env.DUNE_WALLET_BALANCES_QUERY_ID,
      history: process.env.DUNE_HISTORICAL_PRICES_QUERY_ID
    })

    // Execute all queries in parallel
    const [floorPriceResult, salesResult, walletResult, historyResult] = await Promise.all([
      executeDuneQuery(process.env.DUNE_FLOOR_PRICE_QUERY_ID),
      executeDuneQuery(process.env.DUNE_RECENT_SALES_QUERY_ID),
      executeDuneQuery(process.env.DUNE_WALLET_BALANCES_QUERY_ID),
      executeDuneQuery(process.env.DUNE_HISTORICAL_PRICES_QUERY_ID)
    ])

    // Debug logging
    console.log('Floor Price Result:', JSON.stringify(floorPriceResult?.result?.rows?.[0], null, 2))
    console.log('Sales Result:', JSON.stringify(salesResult?.result?.rows?.slice(0, 2), null, 2))
    console.log('History Result:', JSON.stringify(historyResult?.result?.rows?.slice(0, 2), null, 2))

    // Transform the data
    const data = {
      kong: {
        floorPrice: parseFloat(floorPriceResult.result?.rows?.[0]?.floor_price || '0'),
        lastUpdate: new Date().toISOString()
      },
      tokens: {
        prices: salesResult.result?.rows?.reduce((acc, row) => {
          acc[row.token || 'unknown'] = parseFloat(row.price || '0')
          return acc
        }, {}) || {},
        lastUpdate: new Date().toISOString()
      },
      wallet: {
        value: parseFloat(walletResult.result?.rows?.[0]?.total_value || '0'),
        lastUpdate: new Date().toISOString()
      },
      history: (historyResult.result?.rows || []).map(row => ({
        timestamp: new Date(row.date || row.timestamp || Date.now()).toISOString(),
        price: parseFloat(row.price || '0')
      })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      recentSales: (salesResult.result?.rows || []).map(sale => ({
        price: parseFloat(sale.price || '0'),
        tokenId: sale.token_id || sale.tokenId || '0',
        seller: sale.seller_address || sale.seller || '',
        buyer: sale.buyer_address || sale.buyer || '',
        timestamp: new Date(sale.timestamp || sale.date || Date.now()).toISOString(),
        txHash: sale.transaction_hash || sale.txHash || '',
        marketplace: sale.marketplace || 'Unknown',
        currency: 'ETH'
      })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    }

    // Debug logging
    console.log('Transformed Data:', {
      floorPrice: data.kong.floorPrice,
      salesCount: data.recentSales.length,
      historyCount: data.history.length
    })

    // Cache the data
    await setCachedData(data)

    res.status(200).json({
      timestamp: Date.now(),
      data
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    
    // Try to return cached data if available
    const cached = await getCachedData()
    if (cached) {
      return res.status(200).json({
        ...cached,
        error: 'Using cached data due to fetch error'
      })
    }
    
    res.status(500).json({ error: error.message || 'Failed to fetch data' })
  }
} 