import { useState, useEffect } from 'react'
import { getRecentSales } from '../services/priceService'
import { formatDistance } from 'date-fns'
import { ethers } from 'ethers'

// Helper function to safely format timestamp
function formatTimestamp(timestamp) {
  try {
    if (!timestamp) return 'Unknown time'
    const date = new Date(timestamp)
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid date'
    return formatDistance(date, new Date(), { addSuffix: true })
  } catch (err) {
    console.error('Error formatting timestamp:', err)
    return 'Invalid date'
  }
}

export default function RecentTrades() {
  const [trades, setTrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTrades = async () => {
      setIsLoading(true)
      try {
        const recentTrades = await getRecentSales()
        if (recentTrades.length === 0) {
          console.log('No Kong trades found in recent transactions')
        }
        // Filter out trades with invalid timestamps and older than 3 months
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
        
        const validTrades = recentTrades.filter(trade => {
          try {
            const date = new Date(trade.timestamp)
            return !isNaN(date.getTime()) && date >= threeMonthsAgo
          } catch {
            return false
          }
        }).slice(0, 5) // Limit to 5 trades
        setTrades(validTrades)
      } catch (err) {
        setError('Failed to load recent trades')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTrades()
    // Refresh every minute
    const interval = setInterval(loadTrades, 60000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Recent Sales</h3>
      <div className="space-y-4">
        {trades.map(trade => (
          <div key={trade.txHash} className="border-b pb-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">
                  {Number(trade.price).toFixed(4)} {trade.currency}
                </span>
                <div className="text-sm text-gray-500">
                  Token ID: #{trade.tokenId}
                </div>
                <div className="text-xs text-gray-400">
                  Via {trade.marketplace}
                </div>
              </div>
              <div className="flex gap-2">
                <a 
                  href={`https://etherscan.io/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Tx
                </a>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {formatTimestamp(trade.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 