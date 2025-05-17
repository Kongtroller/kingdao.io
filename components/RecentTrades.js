import { useState, useEffect } from 'react'
import { getRecentTrades } from '../services/tradeService'
import { formatDistance } from 'date-fns'
import { ethers } from 'ethers'

export default function RecentTrades() {
  const [trades, setTrades] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTrades = async () => {
      setIsLoading(true)
      try {
        const recentTrades = await getRecentTrades()
        if (recentTrades.length === 0) {
          console.log('No Kong trades found in recent transactions')
        }
        setTrades(recentTrades)
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
                  {Number(ethers.utils.formatEther(trade.price)).toFixed(4)} ETH
                </span>
                <div className="text-sm text-gray-500">
                  Token ID: #{trade.tokenIds?.[0]}
                </div>
                <div className="text-xs text-gray-400">
                  Via {trade.protocol}
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
                <a 
                  href={trade.tokenURIs?.[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600"
                >
                  Metadata
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 