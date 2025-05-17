import { graphqlClient } from '../utils/graphqlClient'

// Validate environment variables
if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
  console.error('Missing NEXT_PUBLIC_CONTRACT_ADDRESS environment variable')
}

const KONG_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.toLowerCase()
const WETH_CONTRACT = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

const FLOOR_PRICE_QUERY = `
  query GetFloorPrice($contract: String!) {
    ethereum(network: ethereum) {
      dexTrades(
        options: {limit: 10, desc: "block.height"}
        baseCurrency: {is: $contract}
        quoteCurrency: {is: "${WETH_CONTRACT}"}
      ) {
        block {
          height
          timestamp {
            time(format: "%Y-%m-%d %H:%M:%S")
          }
        }
        transaction {
          hash
        }
        quotePrice
        tradeAmount(in: USD)
      }
    }
  }
`

const HISTORICAL_PRICES_QUERY = `
  query GetHistoricalPrices($contract: String!, $since: ISO8601DateTime) {
    ethereum(network: ethereum) {
      dexTrades(
        options: {limit: 100, desc: "block.height"}
        baseCurrency: {is: $contract}
        quoteCurrency: {is: "${WETH_CONTRACT}"}
        time: {since: $since}
      ) {
        block {
          height
          timestamp {
            time(format: "%Y-%m-%d")
          }
        }
        quotePrice
        tradeAmount(in: USD)
      }
    }
  }
`

export async function getKongFloorPrice() {
  try {
    console.log('Fetching floor price for contract:', KONG_CONTRACT)
    
    const variables = {
      contract: KONG_CONTRACT
    }
    
    const data = await graphqlClient.request(FLOOR_PRICE_QUERY, variables)
    console.log('BitQuery raw response:', JSON.stringify(data, null, 2))
    
    const trades = data?.ethereum?.dexTrades || []
    console.log('Found trades:', trades.length)
    
    if (trades.length === 0) {
      console.log('No trades found')
      return 0
    }

    // Get the most recent valid trade
    const validTrade = trades.find(trade => 
      trade.quotePrice && trade.quotePrice > 0 && trade.tradeAmount > 0
    )

    if (!validTrade) {
      console.log('No valid trades found with price data')
      return 0
    }

    const price = validTrade.quotePrice
    console.log('Floor price:', price, 'ETH')
    console.log('Trade details:', {
      timestamp: validTrade.block.timestamp.time,
      blockHeight: validTrade.block.height,
      txHash: validTrade.transaction.hash,
      usdAmount: validTrade.tradeAmount
    })
    
    return price
  } catch (error) {
    console.error('Failed to fetch floor price:', error)
    if (error.response?.errors) {
      console.error('GraphQL Errors:', error.response.errors)
    }
    return 0
  }
}

export async function getHistoricalPrices() {
  try {
    // Use 30 days ago as the start date
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const since = thirtyDaysAgo.toISOString()
    
    console.log('Fetching historical prices since:', since)

    const variables = {
      contract: KONG_CONTRACT,
      since
    }

    const data = await graphqlClient.request(HISTORICAL_PRICES_QUERY, variables)
    console.log('Historical data response:', JSON.stringify(data, null, 2))
    
    const trades = data?.ethereum?.dexTrades || []
    console.log('Found historical trades:', trades.length)
    
    if (trades.length === 0) {
      console.log('No historical trades found')
      return []
    }

    // Group by date and get average price for each day
    const pricesByDate = trades.reduce((acc, trade) => {
      // Skip invalid trades
      if (!trade.quotePrice || trade.quotePrice <= 0 || !trade.tradeAmount) {
        return acc
      }

      const date = trade.block.timestamp.time
      if (!acc[date]) {
        acc[date] = {
          sum: trade.quotePrice,
          count: 1,
          volume: trade.tradeAmount
        }
      } else {
        acc[date].sum += trade.quotePrice
        acc[date].count++
        acc[date].volume += trade.tradeAmount
      }
      return acc
    }, {})

    // Convert to array and calculate averages
    const history = Object.entries(pricesByDate)
      .map(([date, {sum, count, volume}]) => ({
        date,
        price: sum / count,
        volume
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    console.log('Processed historical prices:', history)
    return history
  } catch (error) {
    console.error('Failed to fetch historical prices:', error)
    if (error.response?.errors) {
      console.error('GraphQL Errors:', error.response.errors)
    }
    return []
  }
} 