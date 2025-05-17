import { graphqlClient } from '../utils/graphqlClient'
import { TRADES_QUERY } from '../graphql/queries'

const KONG_CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

export async function getRecentTrades() {
  try {
    if (!process.env.NEXT_PUBLIC_BITQUERY_API_KEY) {
      throw new Error('BitQuery API key is not configured')
    }

    const data = await graphqlClient.request(TRADES_QUERY)
    
    if (!data?.EVM?.DEXTrades) {
      console.warn('No trade data returned from BitQuery')
      return []
    }

    return data.EVM.DEXTrades
      .filter(trade => 
        trade.Trade.Buy.Currency.SmartContract?.toLowerCase() === KONG_CONTRACT.toLowerCase()
      )
      .map(trade => ({
        price: trade.Trade.Buy.Price,
        seller: trade.Trade.Buy.Seller,
        buyer: trade.Trade.Buy.Buyer,
        tokenIds: trade.Trade.Buy.Ids,
        tokenURIs: trade.Trade.Buy.URIs,
        protocol: trade.Trade.Dex.ProtocolName,
        currency: trade.Trade.Buy.Currency?.Symbol || 'ETH',
        timestamp: trade.Block.Time,
        txHash: trade.Transaction.Hash
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  } catch (error) {
    if (error.message.includes('unauthorized')) {
      console.error('BitQuery API key is invalid')
    } else {
      console.error('Failed to fetch trades:', error)
    }
    return []
  }
} 