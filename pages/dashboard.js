// pages/dashboard.js
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import NftCard from '../components/NftCard'
import NftSkeleton from '../components/NftSkeleton'
import ErrorBoundary from '../components/ErrorBoundary'
import { useWeb3Init } from '../hooks/useWeb3Init'
import PortfolioStats from '../components/PortfolioStats'
import RecentTrades from '../components/RecentTrades'

const ITEMS_PER_PAGE = 6

export default function Dashboard() {
  const { account, active, library } = useWeb3React()
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

  // Calculate pagination
  const totalPages = Math.ceil((nfts || []).length / ITEMS_PER_PAGE)
  const paginatedNfts = (nfts || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!active || !account || !library) {
      setCheckingAuth(false)
      return
    }

    const checkNFTOwnership = async () => {
      setCheckingAuth(true)
      try {
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          ['function balanceOf(address) view returns (uint256)'],
          library
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
  }, [active, account, library])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get ETH balance
      const ethBalance = await library.getBalance(account)
      setEthBalance(ethers.utils.formatEther(ethBalance))
      
      // Get NFTs using contract
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          'function balanceOf(address) view returns (uint256)',
          'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
          'function tokenURI(uint256) view returns (string)'
        ],
        library
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
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2">Verifying NFT ownership...</p>
      </div>
    )
  }

  // Show connect wallet message if not connected
  if (!active || !account) {
    return (
      <div className="p-4 text-center">
        <p>Please connect your wallet to view the dashboard</p>
      </div>
    )
  }

  // Show unauthorized message if no NFTs owned
  if (!isAuthorized) {
    return (
      <div className="p-4 text-center">
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
      <div className="p-6 max-w-6xl mx-auto">
        <div className="grid gap-6">
          <PortfolioStats nftCount={nfts.length} />
          <RecentTrades />
          <div className="grid gap-6 md:grid-cols-2">
            {/* Portfolio Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              ) : (
                <>
                  <p className="text-lg">ETH Balance: {ethBalance} ETH</p>
                  <p className="text-lg">Kong NFTs: {nfts?.length || 0}</p>
                </>
              )}
            </div>

            {/* NFT Gallery */}
            <div className="bg-white p-6 rounded-lg shadow">
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
      </div>
    </ErrorBoundary>
  )
}
