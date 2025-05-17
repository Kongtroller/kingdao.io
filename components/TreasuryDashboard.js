import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { getMultiSigBalances, getTokenBalances } from '../services/walletService'
import { getTreasuryData } from '../services/spreadsheetService'
import { getNFTPortfolioData } from '../services/nftPortfolioService'
import TreasuryChart from './TreasuryChart'
import { formatCurrency, formatAddress } from '../utils/format'
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
import { Line, Doughnut } from 'react-chartjs-2'

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

export default function TreasuryDashboard() {
  const { library } = useWeb3React()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [treasuryData, setTreasuryData] = useState(null)
  const [multiSigData, setMultiSigData] = useState(null)
  const [nftPortfolio, setNftPortfolio] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('value')

  useEffect(() => {
    async function loadDashboardData() {
      if (!library) return
      
      setIsLoading(true)
      setError(null)

      try {
        // Fetch all data in parallel
        const [
          multiSigBalances,
          treasurySheetData,
          nftData
        ] = await Promise.all([
          getMultiSigBalances(library),
          getTreasuryData(),
          getNFTPortfolioData(Object.values(multiSigBalances || {}).map(w => w.address), library)
        ])

        // Fetch token balances for each multi-sig
        if (multiSigBalances) {
          for (const [name, data] of Object.entries(multiSigBalances)) {
            data.tokens = await getTokenBalances(data.address, library)
          }
        }

        setMultiSigData(multiSigBalances)
        setTreasuryData(treasurySheetData)
        setNftPortfolio(nftData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [library])

  const filteredNFTs = nftPortfolio ? 
    Object.entries(nftPortfolio)
      .filter(([_, collection]) => {
        if (filter === 'all') return true
        return collection.holdings.some(h => h.balance > 0)
      })
      .sort(([_, a], [__, b]) => {
        if (sortBy === 'value') return b.totalValue - a.totalValue
        return b.holdings.length - a.holdings.length
      }) : []

  const totalTreasuryValue = multiSigData ? 
    Object.values(multiSigData).reduce((sum, wallet) => {
      const ethValue = parseFloat(wallet.ethBalance) * (wallet.ethPrice || 0)
      const tokenValue = wallet.tokens?.reduce((acc, token) => 
        acc + parseFloat(token.balance) * (token.price || 0), 0) || 0
      return sum + ethValue + tokenValue
    }, 0) : 0

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Treasury Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Treasury Overview</h2>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalTreasuryValue)}
          </div>
        </div>
        {treasuryData && <TreasuryChart treasuryData={treasuryData} />}
      </div>

      {/* Multi-sig Wallets */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Multi-sig Wallets</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {multiSigData && Object.entries(multiSigData).map(([name, data]) => (
            <div key={name} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
              <h3 className="font-semibold capitalize">{name}</h3>
              <p className="text-sm text-gray-500 truncate">{formatAddress(data.address)}</p>
              <p className="mt-2 font-medium">{data.ethBalance} ETH</p>
              <div className="mt-2 space-y-1">
                {data.tokens?.map(token => (
                  <div key={token.symbol} className="flex justify-between text-sm">
                    <span>{token.balance} {token.symbol}</span>
                    <span className="text-gray-500">{formatCurrency(token.balance * (token.price || 0))}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NFT Portfolio */}
      {nftPortfolio && Object.keys(nftPortfolio).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">NFT Portfolio</h2>
            <div className="flex gap-4">
              <select 
                className="border rounded px-2 py-1"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Collections</option>
                <option value="active">Active Holdings</option>
              </select>
              <select
                className="border rounded px-2 py-1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="value">Sort by Value</option>
                <option value="quantity">Sort by Quantity</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredNFTs.map(([id, collection]) => (
              <div key={id} className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{collection.name}</h3>
                  <span className="text-sm text-gray-500">
                    Floor: {formatCurrency(collection.floorPrice || 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{formatAddress(collection.address)}</p>
                <ul className="mt-2 space-y-1">
                  {collection.holdings.map((holding, i) => (
                    <li key={i} className="text-sm flex justify-between">
                      <span>{holding.balance} NFTs in {formatAddress(holding.wallet)}</span>
                      <span className="text-gray-500">
                        ≈{formatCurrency(holding.balance * (collection.floorPrice || 0))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 