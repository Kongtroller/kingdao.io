// API helpers
async function fetchEndpointData(endpoint) {
  try {
    const response = await fetch(endpoint)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API error:', error)
    throw error
  }
}

export async function getKongFloorPrice() {
  try {
    const result = await fetchEndpointData('/api/dune-data')
    return result.data?.kong?.floorPrice || 0
  } catch (error) {
    console.error('Failed to fetch floor price:', error)
    return 0
  }
}

export async function getTokenPrices() {
  try {
    const result = await fetchEndpointData('/api/dune-data')
    return result.data?.tokens?.prices || {}
  } catch (error) {
    console.error('Failed to fetch token prices:', error)
    return {}
  }
}

export async function getWalletBalances() {
  try {
    const result = await fetchEndpointData('/api/dune-data')
    return result.data?.wallet?.value || 0
  } catch (error) {
    console.error('Failed to fetch wallet balances:', error)
    return 0
  }
}

export async function getHistoricalPrices() {
  try {
    const result = await fetchEndpointData('/api/dune-data')
    return result.data?.history || []
  } catch (error) {
    console.error('Failed to fetch historical prices:', error)
    return []
  }
}

export async function getRecentSales() {
  try {
    const result = await fetchEndpointData('/api/dune-data')
    return result.data?.recentSales || []
  } catch (error) {
    console.error('Failed to fetch recent sales:', error)
    return []
  }
} 