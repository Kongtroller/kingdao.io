import { useState, useEffect } from 'react'
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
  const [multisigValue, setMultisigValue] = useState(0)
  const [tokenPrices, setTokenPrices] = useState({})
  const [historicalPrices, setHistoricalPrices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/dune-data')
        const result = await response.json()

        if (result.error) {
          console.warn('API Warning:', result.error)
        }

        const { kong, wallet, tokens, history } = result.data

        // Update floor price and portfolio value
        if (kong?.floorPrice) {
          setFloorPrice(kong.floorPrice)
          setPortfolioValue(kong.floorPrice * nftCount)
        }

        // Update multisig value
        if (wallet?.value) {
          setMultisigValue(wallet.value)
        }

        // Update token prices
        if (tokens?.prices) {
          setTokenPrices(tokens.prices)
        }

        // Update historical prices
        if (history) {
          setHistoricalPrices(history)
        }

        setLastUpdated(new Date(result.timestamp))
      } catch (err) {
        console.error('Error loading stats:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
    // Refresh data every minute
    const interval = setInterval(loadStats, 60 * 1000)
    return () => clearInterval(interval)
  }, [nftCount])

  const chartData = {
    labels: historicalPrices.map(p => new Date(p.timestamp).toLocaleDateString()),
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
        text: 'Price History'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw
            return `Floor Price: ${value.toFixed(4)} ETH`
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
      }
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
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
    return <div className="text-red-500">Error loading data: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Floor Price</h3>
          <p className="text-3xl font-bold">{floorPrice.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdated?.toLocaleTimeString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Portfolio Value</h3>
          <p className="text-3xl font-bold">{portfolioValue.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-500 mt-1">
            {nftCount} Kong NFTs
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Treasury Value</h3>
          <p className="text-3xl font-bold">{multisigValue.toFixed(4)} ETH</p>
          <p className="text-sm text-gray-500 mt-1">
            Multisig Balance
          </p>
        </div>
      </div>
      
      {Object.keys(tokenPrices).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Token Prices</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(tokenPrices).map(([token, price]) => (
              <div key={token} className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium">{token}</h4>
                <p className="text-xl">${Number(price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
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