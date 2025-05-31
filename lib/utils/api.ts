// Maximum number of retries for API calls
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second
const COINGECKO_PROXY = 'https://api.coingecko.com/api/v3'

// Sleep function for delay between retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

interface FetchWithRetryOptions {
  retries?: number
  delayMs?: number
  headers?: Record<string, string>
  mode?: RequestMode
}

export async function fetchWithRetry<T>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<T | null> {
  const {
    retries = MAX_RETRIES,
    delayMs = RETRY_DELAY,
    headers = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    },
    mode = 'cors'
  } = options

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { 
        headers,
        mode,
        credentials: 'omit'
      })
      
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('Rate limited by CoinGecko, retrying...')
        const retryAfter = response.headers.get('Retry-After')
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : delayMs * Math.pow(2, i)
        await sleep(delay)
        continue
      }

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
    const data = await fetchWithRetry<Record<string, { usd: number }>>(
      `${COINGECKO_PROXY}/simple/token_price/ethereum?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    if (!data) {
      console.warn(`No price data returned for token ${tokenAddress}`)
      return 0
    }

    return data[tokenAddress.toLowerCase()]?.usd || 0
  } catch (error) {
    console.error(`Failed to fetch price for token ${tokenAddress}:`, error)
    return 0
  }
}

export async function fetchEthPrice(): Promise<number> {
  try {
    const data = await fetchWithRetry<{ ethereum: { usd: number } }>(
      `${COINGECKO_PROXY}/simple/price?ids=ethereum&vs_currencies=usd`,
      {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    if (!data) {
      console.warn('No ETH price data returned')
      return 0
    }

    return data.ethereum?.usd || 0
  } catch (error) {
    console.error('Failed to fetch ETH price:', error)
    return 0
  }
} 