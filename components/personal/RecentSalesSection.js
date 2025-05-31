import { useState, useEffect } from 'react'
import { getRecentSales } from '@/services/priceService'
import { formatDistance } from 'date-fns'
import { formatCurrency } from '@/utils/format'

export default function RecentSalesSection() {
  const [sales, setSales] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSales = async () => {
      setIsLoading(true)
      try {
        const recentSales = await getRecentSales()
        setSales(recentSales.slice(0, 5)) // Show only last 5 sales
      } catch (err) {
        console.error('Failed to load recent sales:', err)
        setError('Failed to load recent sales')
      } finally {
        setIsLoading(false)
      }
    }

    loadSales()
    const interval = setInterval(loadSales, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-700 h-16 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
        {error}
      </div>
    )
  }

  if (!sales.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
        No recent sales found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sales.map((sale) => (
        <div
          key={sale.txHash}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                Kong #{sale.tokenId}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(sale.price)} ETH
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistance(new Date(sale.timestamp), new Date(), { addSuffix: true })}
              </div>
              <a
                href={`https://etherscan.io/tx/${sale.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Transaction
              </a>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">From: </span>
            <a
              href={`https://etherscan.io/address/${sale.seller}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {sale.seller.slice(0, 6)}...{sale.seller.slice(-4)}
            </a>
            <span className="text-gray-500 dark:text-gray-400"> To: </span>
            <a
              href={`https://etherscan.io/address/${sale.buyer}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {sale.buyer.slice(0, 6)}...{sale.buyer.slice(-4)}
            </a>
          </div>
        </div>
      ))}
    </div>
  )
} 