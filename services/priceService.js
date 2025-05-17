import { graphqlClient } from '../utils/graphqlClient'

const FLOOR_PRICE_QUERY = `
  query {
    ethereum(network: ethereum) {
      dexTrades(
        options: { limit: 1, desc: "block.timestamp" }
        baseCurrency: { is: "0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328" }
      ) {
        transaction {
          hash
        }
        block {
          timestamp {
            time(format: "%Y-%m-%d %H:%M:%S")
          }
        }
        tradeAmount(in: USD)
        baseAmount
        baseCurrency {
          symbol
          address
        }
        quoteCurrency {
          symbol
        }
        exchange {
          fullName
        }
      }
    }
  }
`

export async function getKongFloorPrice() {
  try {
    console.log('Fetching floor price...')
    console.log('Using contract:', process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
    
    const data = await graphqlClient.request(FLOOR_PRICE_QUERY)
    console.log('BitQuery raw response:', JSON.stringify(data, null, 2))
    
    const trades = data?.ethereum?.dexTrades || []
    console.log('Found trades:', JSON.stringify(trades, null, 2))
    
    if (trades.length === 0) {
      console.log('No trades found')
      return 0
    }

    const price = trades[0]?.buyAmount || 0
    console.log('Floor price:', price)
    
    return price
  } catch (error) {
    console.error('Failed to fetch floor price:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      request: error.request
    })
    return 0
  }
}

export async function getHistoricalPrices() {
  // We'll implement this next
  return []
} 