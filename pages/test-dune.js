import { useState, useEffect } from 'react'

export default function TestDune() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [data, setData] = useState({
    kong: null,
    tokens: null,
    wallet: null
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dune-data')
      const result = await response.json()
      
      if (result.error) {
        console.warn('API Warning:', result.error)
      }
      
      setData(result.data)
      setLastUpdated(new Date(result.lastUpdate))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Client-side polling every minute to check for new cached data
    const interval = setInterval(fetchData, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const DataCard = ({ title, value, currency, lastUpdate, type = 'number' }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      {value !== null ? (
        <div className="space-y-2">
          <div className="text-4xl font-bold text-blue-600">
            {type === 'number' ? (
              <>{Number(value).toFixed(4)} {currency}</>
            ) : type === 'object' ? (
              <pre className="text-sm overflow-auto">{JSON.stringify(value, null, 2)}</pre>
            ) : value}
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(lastUpdate).toLocaleString()}
          </div>
        </div>
      ) : (
        <div className="text-gray-500">No data available</div>
      )}
    </div>
  )

  return (
    <div className="p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">King DAO Dune Analytics Data</h1>
        <div className="text-sm text-gray-600">
          {lastUpdated && (
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {loading && !data.kong && !data.tokens && !data.wallet && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded">
          Loading initial data...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {loading && (data.kong || data.tokens || data.wallet) && (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
          Checking for updates...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DataCard
          title="Kong Floor Price"
          value={data.kong?.floorPrice}
          currency={data.kong?.currency}
          lastUpdate={data.kong?.lastUpdate}
        />
        <DataCard
          title="Token Prices"
          value={data.tokens?.prices}
          lastUpdate={data.tokens?.lastUpdate}
          type="object"
        />
        <DataCard
          title="Wallet Balances"
          value={data.wallet?.value}
          currency={data.wallet?.currency}
          lastUpdate={data.wallet?.lastUpdate}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Environment Variables Status</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Floor Price API:{' '}
            <span className={process.env.DUNE_NFT_FLOOR_PRICE_API ? 'text-green-600' : 'text-red-600'}>
              {process.env.DUNE_NFT_FLOOR_PRICE_API ? '✅ Set' : '❌ Missing'}
            </span>
          </li>
          <li>
            Token Prices API:{' '}
            <span className={process.env.DUNE_NFT_TOKEN_PRICES_API ? 'text-green-600' : 'text-red-600'}>
              {process.env.DUNE_NFT_TOKEN_PRICES_API ? '✅ Set' : '❌ Missing'}
            </span>
          </li>
          <li>
            Wallet Balances API:{' '}
            <span className={process.env.DUNE_WALLET_BALANCES_API ? 'text-green-600' : 'text-red-600'}>
              {process.env.DUNE_WALLET_BALANCES_API ? '✅ Set' : '❌ Missing'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
} 