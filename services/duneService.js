const DUNE_API_BASE = 'https://api.dune.com/api/v1'

export async function getDuneQueryResult(queryId) {
  try {
    if (!queryId) {
      console.error('No query ID provided')
      return []
    }

    console.log(`Fetching Dune query ${queryId}...`)
    console.log('Environment variables:', {
      TOKEN_PRICES: DUNE_QUERIES.TOKEN_PRICES,
      NFT_FLOOR_PRICES: DUNE_QUERIES.NFT_FLOOR_PRICES,
      WALLET_BALANCES: DUNE_QUERIES.WALLET_BALANCES
    })

    const response = await fetch(`/api/dune?queryId=${queryId}`)
    const responseText = await response.text()

    if (!response.ok) {
      let errorDetails
      try {
        errorDetails = JSON.parse(responseText)
      } catch (e) {
        errorDetails = responseText
      }
      console.error(`Dune API error (${response.status}):`, errorDetails)
      return []
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse response:', responseText)
      return []
    }

    // Check if we have a valid response with rows
    if (!data?.result?.rows) {
      console.warn(`Invalid or empty response for query ${queryId}:`, data)
      return []
    }

    return data.result.rows
  } catch (error) {
    console.error('Failed to fetch Dune query result:', error)
    return []
  }
}

// Query IDs for different data types
export const DUNE_QUERIES = {
  TOKEN_PRICES: process.env.NEXT_PUBLIC_DUNE_TOKEN_PRICES_QUERY_ID,
  NFT_FLOOR_PRICES: process.env.NEXT_PUBLIC_DUNE_NFT_FLOOR_PRICES_QUERY_ID,
  WALLET_BALANCES: process.env.NEXT_PUBLIC_DUNE_WALLET_BALANCES_QUERY_ID
}

export async function getTokenPrices() {
  console.log('Getting token prices with query ID:', DUNE_QUERIES.TOKEN_PRICES)
  const results = await getDuneQueryResult(DUNE_QUERIES.TOKEN_PRICES)
  console.log('Token prices raw results:', results)
  if (!results) return {}

  return results.reduce((acc, row) => {
    if (!row.token_address || !row.price) {
      console.warn('Invalid row in token prices:', row)
      return acc
    }
    acc[row.token_address.toLowerCase()] = {
      price: parseFloat(row.price),
      symbol: row.symbol
    }
    return acc
  }, {})
}

export async function getNFTFloorPrices() {
  console.log('Getting NFT floor prices with query ID:', DUNE_QUERIES.NFT_FLOOR_PRICES)
  const results = await getDuneQueryResult(DUNE_QUERIES.NFT_FLOOR_PRICES)
  console.log('NFT floor prices raw results:', results)
  if (!results) return {}

  return results.reduce((acc, row) => {
    if (!row.collection_address || !row.floor_price) {
      console.warn('Invalid row in NFT floor prices:', row)
      return acc
    }
    acc[row.collection_address.toLowerCase()] = {
      floorPrice: parseFloat(row.floor_price),
      lastUpdate: row.last_update
    }
    return acc
  }, {})
}

export async function getWalletBalances(addresses) {
  console.log('Getting wallet balances with query ID:', DUNE_QUERIES.WALLET_BALANCES)
  console.log('Checking balances for addresses:', addresses)
  const results = await getDuneQueryResult(DUNE_QUERIES.WALLET_BALANCES)
  console.log('Wallet balances raw results:', results)
  if (!results) return {}

  return results.reduce((acc, row) => {
    if (!row.wallet_address || !row.token_address) {
      console.warn('Invalid row in wallet balances:', row)
      return acc
    }
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

// New function to fetch all data sequentially
export async function getAllDuneData(addresses) {
  console.log('Fetching all Dune data sequentially...')
  
  // Get token prices first
  console.log('Step 1: Fetching token prices...')
  const tokenPrices = await getTokenPrices()
  
  // Wait a bit between requests to ensure the previous one is done
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Get NFT floor prices next
  console.log('Step 2: Fetching NFT floor prices...')
  const nftPrices = await getNFTFloorPrices()
  
  // Wait again
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Finally get wallet balances
  console.log('Step 3: Fetching wallet balances...')
  const walletBalances = await getWalletBalances(addresses)
  
  return {
    tokens: tokenPrices,
    nfts: nftPrices,
    wallets: walletBalances
  }
} 