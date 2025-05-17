const DUNE_API_BASE = 'https://api.dune.com/api-referencev1'

export async function getDuneQueryResult(queryId) {
  try {
    const response = await fetch(`${DUNE_API_BASE}/query/${queryId}/results`, {
      headers: {
        'x-dune-api-key': process.env.DUNE_API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`Dune API error: ${response.status}`)
    }

    const data = await response.json()
    return data.result.rows
  } catch (error) {
    console.error('Failed to fetch Dune query result:', error)
    return null
  }
}

// Query IDs for different data types
export const DUNE_QUERIES = {
  TOKEN_PRICES: process.env.DUNE_TOKEN_PRICES_QUERY_ID,
  NFT_FLOOR_PRICES: process.env.DUNE_NFT_FLOOR_PRICES_QUERY_ID,
  WALLET_BALANCES: process.env.DUNE_WALLET_BALANCES_QUERY_ID
}

export async function getTokenPrices() {
  const results = await getDuneQueryResult(DUNE_QUERIES.TOKEN_PRICES)
  if (!results) return {}

  return results.reduce((acc, row) => {
    acc[row.token_address.toLowerCase()] = {
      price: parseFloat(row.price),
      symbol: row.symbol
    }
    return acc
  }, {})
}

export async function getNFTFloorPrices() {
  const results = await getDuneQueryResult(DUNE_QUERIES.NFT_FLOOR_PRICES)
  if (!results) return {}

  return results.reduce((acc, row) => {
    acc[row.collection_address.toLowerCase()] = {
      floorPrice: parseFloat(row.floor_price),
      lastUpdate: row.last_update
    }
    return acc
  }, {})
}

export async function getWalletBalances(addresses) {
  const results = await getDuneQueryResult(DUNE_QUERIES.WALLET_BALANCES)
  if (!results) return {}

  return results.reduce((acc, row) => {
    const address = row.wallet_address.toLowerCase()
    if (addresses.includes(address)) {
      if (!acc[address]) {
        acc[address] = {
          tokens: []
        }
      }
      acc[address].tokens.push({
        address: row.token_address,
        symbol: row.token_symbol,
        balance: parseFloat(row.balance),
        price: parseFloat(row.price || 0)
      })
    }
    return acc
  }, {})
} 