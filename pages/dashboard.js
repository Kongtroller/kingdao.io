import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { useTheme } from 'next-themes'
import NftCard from '../components/NftCard'
import NftSkeleton from '../components/NftSkeleton'
import ErrorBoundary from '../components/ErrorBoundary'
import { useWeb3Init } from '../hooks/useWeb3Init'
import PortfolioStats from '../components/PortfolioStats'
import RecentTrades from '../components/RecentTrades'
import TreasuryDashboard from '../components/TreasuryDashboard'
import HistoricalPriceChart from '../components/HistoricalPriceChart'
import config from '@/config/config'
import { Sun, Moon } from 'lucide-react'

import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from 'wagmi'

const ITEMS_PER_PAGE = 6

export default function Dashboard() {
  const { theme, setTheme } = useTheme()
  const { address: account, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const tried = useWeb3Init()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [nfts, setNfts] = useState([])
  const [ethBalance, setEthBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')

  // Pagination
  const totalPages = Math.ceil((nfts || []).length / ITEMS_PER_PAGE)
  const paginatedNfts = (nfts || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isConnected) {
      setCheckingAuth(false)
      return
    }
    if (!account) return

    const checkNFTOwnership = async () => {
      setCheckingAuth(true)
      try {
        // Provider for read
        const provider = publicClient ? new ethers.providers.Web3Provider(publicClient) : ethers.getDefaultProvider()
        const contract = new ethers.Contract(
          config.NFTcontract,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        )

        const balance = await contract.balanceOf(account)
        setIsAuthorized(balance.gt(0))
        
        // Only load data if user is authorized
        if (balance.gt(0)) {
          await loadData()
        }
      } catch (err) {
        console.error('Failed to check NFT ownership:', err)
        setError('Failed to verify NFT ownership')
      } finally {
        setCheckingAuth(false)
      }
    }

    checkNFTOwnership()
  }, [account, isConnected, publicClient])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Provider for read
      const provider = publicClient ? new ethers.providers.Web3Provider(publicClient) : ethers.getDefaultProvider()
      // ETH balance
      const ethBalanceRaw = await provider.getBalance(account)
      setEthBalance(ethers.utils.formatEther(ethBalanceRaw))

      // NFTs
      const contract = new ethers.Contract(
        config.NFTcontract,
        [
          'function balanceOf(address) view returns (uint256)',
          'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
          'function tokenURI(uint256) view returns (string)'
        ],
        provider
      )

      const nftBalance = await contract.balanceOf(account)
      const tokenPromises = []

      for (let i = 0; i < nftBalance.toNumber(); i++) {
        tokenPromises.push(
          contract.tokenOfOwnerByIndex(account, i)
            .then(async tokenId => {
              const uri = await contract.tokenURI(tokenId)
              return { id: tokenId.toString(), uri }
            })
        )
      }

      const tokens = await Promise.all(tokenPromises)
      setNfts(tokens)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError(err.message || 'Failed to load portfolio data')
    } finally {
      setIsLoading(false)
    }
  }

  // Early return for SSR
  if (!mounted) return null

  // Show loading state while checking authorization
  if (checkingAuth) {
    return (
      <div className="p-60 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Verifying NFT ownership...</p>
      </div>
    )
  }

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <div className="p-60 text-center">
        <p>Please connect your wallet to view the dashboard</p>
      </div>
    )
  }

  // Show unauthorized message if no NFTs owned
  if (!isAuthorized) {
    return (
      <div className="p-60 text-center">
        <h2 className="text-xl font-bold mb-4">Access Denied</h2>
        <p>You need to own at least one Kong NFT to access the dashboard.</p>
        <a 
          href="https://blur.io/eth/collection/konginvestment" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 mt-4 inline-block"
        >
          Buy a Kong NFT on blur
        </a>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="p-6 py-16 sm:py-24 max-w-7xl mx-auto">
        {/* Theme Toggle and Tabs */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'personal'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              Personal Dashboard
            </button>
            <button
              onClick={() => setActiveTab('dao')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dao'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              DAO Dashboard
            </button>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {activeTab === 'personal' ? (
          <div className="grid gap-6">
            {/* Main Content Area */}
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Portfolio Stats */}
              <div className="col-span-2">
                <PortfolioStats nftCount={nfts.length} />
                
                {/* Historical Price Chart */}
                <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-bold mb-4">Historical Price Data</h2>
                  <HistoricalPriceChart />
                </div>
              </div>

              {/* Right Column - Recent Sales */}
              <div className="col-span-1">
                <RecentTrades />
              </div>
            </div>

            {/* Portfolio Details */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Portfolio Summary */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-lg">ETH Balance: {ethBalance} ETH</p>
                    <p className="text-lg">Kong NFTs: {nfts?.length || 0}</p>
                  </>
                )}
              </div>

              {/* NFT Gallery */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Your Kong NFTs</h2>
                <div className="grid gap-4 grid-cols-2">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => <NftSkeleton key={i} />)
                  ) : (
                    paginatedNfts.map(nft => <NftCard key={nft.id} nft={nft} />)
                  )}
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    {Array(totalPages).fill(0).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === i + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <TreasuryDashboard />
        )}
      </div>
    </ErrorBoundary>
  )
}
