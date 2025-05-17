import { useState, useEffect } from 'react'
import { getAllDuneData } from '../services/duneService'
import { MULTISIG_ADDRESSES } from '../services/walletService'

export default function TestDune() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState({
    tokens: null,
    nfts: null,
    wallets: null
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Use the new sequential fetching function
        const result = await getAllDuneData(Object.values(MULTISIG_ADDRESSES))
        setData(result)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-4">Loading Dune data...</div>
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-4">Dune Analytics Test Data</h1>

      <div>
        <h2 className="text-xl font-semibold mb-2">Token Prices</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data.tokens, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">NFT Floor Prices</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data.nfts, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Wallet Balances</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(data.wallets, null, 2)}
        </pre>
      </div>

      <div className="mt-4 space-y-2">
        <p><strong>Environment Variables:</strong></p>
        <ul className="list-disc list-inside">
          <li>DUNE_API_KEY: {process.env.DUNE_API_KEY ? '✅ Set' : '❌ Missing'}</li>
          <li>TOKEN_PRICES_QUERY_ID: {process.env.NEXT_PUBLIC_DUNE_TOKEN_PRICES_QUERY_ID ? '✅ Set' : '❌ Missing'}</li>
          <li>NFT_FLOOR_PRICES_QUERY_ID: {process.env.NEXT_PUBLIC_DUNE_NFT_FLOOR_PRICES_QUERY_ID ? '✅ Set' : '❌ Missing'}</li>
          <li>WALLET_BALANCES_QUERY_ID: {process.env.NEXT_PUBLIC_DUNE_WALLET_BALANCES_QUERY_ID ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>
    </div>
  )
} 