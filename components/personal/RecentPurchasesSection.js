import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getRecentSales } from '@/services/priceService'
import { formatDistance } from 'date-fns'
import { formatCurrency } from '@/utils/format'

export default function RecentPurchasesSection() {
  const { address } = useAccount()
  const [purchases, setPurchases] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPurchases = async () => {
      if (!address) return
      setIsLoading(true)
      try {
        const allSales = await getRecentSales()
        // Filter sales where the connected wallet is the buyer
        const userPurchases = allSales
          .filter(sale => sale.buyer.toLowerCase() === address.toLowerCase())
          .slice(0, 5) // Show only last 5 purchases
        setPurchases(userPurchases)
      } catch (err) {
        console.error('Failed to load purchases:', err)
        setError('Failed to load your purchases')
      } finally {
        setIsLoading(false)
      }
    }

    loadPurchases()
    const interval = setInterval(loadPurchases, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [address])

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

  if (!purchases.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
        No purchases found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <div
          key={purchase.txHash}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium">
                Kong #{purchase.tokenId}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(purchase.price)} ETH
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistance(new Date(purchase.timestamp), new Date(), { addSuffix: true })}
              </div>
              <a
                href={`https://etherscan.io/tx/${purchase.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Transaction
              </a>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Purchased from: </span>
            <a
              href={`https://etherscan.io/address/${purchase.seller}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {purchase.seller.slice(0, 6)}...{purchase.seller.slice(-4)}
            </a>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              via {purchase.marketplace}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
} 