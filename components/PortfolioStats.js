import { useState, useEffect } from 'react'
import { getKongFloorPrice } from '../services/priceService'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function PortfolioStats({ nftCount }) {
  const [floorPrice, setFloorPrice] = useState(0)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      try {
        const price = await getKongFloorPrice()
        console.log('Received price:', price)
        setFloorPrice(price)
        setPortfolioValue(price * nftCount)
      } catch (err) {
        console.error('Error loading stats:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [nftCount])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading price data: {error}</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Floor Price</h3>
        <p className="text-3xl font-bold">{floorPrice.toFixed(4)} ETH</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
        <p className="text-3xl font-bold">{portfolioValue.toFixed(4)} ETH</p>
      </div>
    </div>
  )
} 