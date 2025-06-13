// Maximum number of retries for API calls
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Sleep function for delay between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface FetchWithRetryOptions {
  retries?: number
  delayMs?: number
  headers?: Record<string, string>
}

export async function fetchWithRetry<T>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T | null> {
  const {
    retries = MAX_RETRIES,
    delayMs = RETRY_DELAY,
    headers = {
      'Accept': 'application/json'
    }
  } = options

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Attempt ${i + 1} failed for ${url}:`, error)
      
      // If this was our last retry, return null instead of throwing
      if (i === retries - 1) {
        return null
      }

      // Wait before retrying with exponential backoff
      await sleep(delayMs * Math.pow(2, i))
    }
  }

  return null
}

// Specific function for CoinGecko API calls
export async function fetchCoinGeckoPrice(
  tokenAddress: string
): Promise<number> {
  try {
    const data = await fetchWithRetry<{ price: number }>(
      `/api/prices?type=token&address=${tokenAddress}`
    )

    if (!data) {
      console.warn(`No price data returned for token ${tokenAddress}`)
      return 0
    }

    return data.price
  } catch (error) {
    console.error(`Failed to fetch price for token ${tokenAddress}:`, error)
    return 0
  }
}

export async function fetchEthPrice(): Promise<number> {
  try {
    const data = await fetchWithRetry<{ price: number }>(
      `/api/prices?type=eth`
    )

    if (!data) {
      console.warn('No ETH price data returned')
      return 0
    }

    return data.price
  } catch (error) {
    console.error('Failed to fetch ETH price:', error)
    return 0
  }
} 