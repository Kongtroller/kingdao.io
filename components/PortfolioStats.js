import { useState, useEffect } from 'react'
import { getKongFloorPrice, getHistoricalPrices } from '../services/priceService'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function PortfolioStats({ nftCount }) {
  const [floorPrice, setFloorPrice] = useState(0)
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [historicalPrices, setHistoricalPrices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      try {
        const [price, history] = await Promise.all([
          getKongFloorPrice(),
          getHistoricalPrices()
        ])
        console.log('Received floor price:', price)
        console.log('Received price history:', history)

        if (price === 0 && history.length > 0) {
          // If current price is unavailable, use latest historical price
          const latestPrice = history[history.length - 1].price
          setFloorPrice(latestPrice)
          setPortfolioValue(latestPrice * nftCount)
        } else {
          setFloorPrice(price)
          setPortfolioValue(price * nftCount)
        }
        
        setHistoricalPrices(history)
      } catch (err) {
        console.error('Error loading stats:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [nftCount])

  const chartData = {
    labels: historicalPrices.map(p => p.date),
    datasets: [
      {
        label: 'Floor Price (ETH)',
        data: historicalPrices.map(p => p.price),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5
      },
      {
        label: 'Trading Volume (USD)',
        data: historicalPrices.map(p => p.volume),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        yAxisID: 'y1'
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Price & Volume History'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw
            const datasetLabel = context.dataset.label
            if (datasetLabel.includes('Volume')) {
              return `${datasetLabel}: $${value.toLocaleString()}`
            }
            return `${datasetLabel}: ${value.toFixed(4)} ETH`
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Price (ETH)'
        },
        ticks: {
          callback: value => `${value.toFixed(4)} ETH`
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Volume (USD)'
        },
        ticks: {
          callback: value => `$${value.toLocaleString()}`
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
        <div className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading price data: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Floor Price</h3>
          <p className="text-3xl font-bold">{floorPrice.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-500 mt-1">
            ${(floorPrice * 2000).toLocaleString()} USD
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
          <p className="text-3xl font-bold">{portfolioValue.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-500 mt-1">
            ${(portfolioValue * 2000).toLocaleString()} USD
          </p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        {historicalPrices.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No historical price data available
          </div>
        )}
      </div>
    </div>
  )
} 