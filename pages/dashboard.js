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
import DashboardLayout from '@/components/layouts/DashboardLayout'
import config from '@/config/config'
import { Sun, Moon } from 'lucide-react'

import {
  useAccount,
  usePublicClient,
  useWalletClient,
} from 'wagmi'

const ITEMS_PER_PAGE = 8

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

  useEffect(() => {
    if (router.pathname === '/dashboard/dao') {
      setActiveTab('dao')
    } else {
      setActiveTab('personal')
    }
  }, [router.pathname])

  const handleTabChange = (value) => {
    if (value === 'dao') {
      router.push('/dashboard/dao')
    } else {
      router.push('/dashboard')
    }
  }

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
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <div className="p-60 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Verifying NFT ownership...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show connect wallet message if not connected
  if (!isConnected) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
        <div className="p-60 text-center">
          <p>Please connect your wallet to view the dashboard</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show unauthorized message if no NFTs owned
  if (!isAuthorized) {
    return (
      <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
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
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === 'personal' ? (
        <>
          <PortfolioStats ethBalance={ethBalance} nfts={nfts} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8 auto-rows-auto">
            {isLoading
              ? Array(ITEMS_PER_PAGE)
                  .fill(null)
                  .map((_, i) => <NftSkeleton key={i} />)
              : paginatedNfts.map((nft) => (
                  <NftCard key={nft.id} nft={nft} />
                ))}
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <TreasuryDashboard />
      )}
    </DashboardLayout>
  )
}
