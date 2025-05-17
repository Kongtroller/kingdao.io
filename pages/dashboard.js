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

  // Calculate pagination
  const totalPages = Math.ceil((nfts || []).length / ITEMS_PER_PAGE)
  const paginatedNfts = (nfts || []).slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // All useEffects together
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!active || !account || !library) return

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

    loadData()
  }, [active, account, library])

  // Early return for SSR
  if (!mounted) return null

  // Other conditional renders
  if (!active || !account) {
    return (
      <div className="p-4 text-center">
        <p>Please connect your wallet to view the dashboard</p>
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
              {error ? (
                <div className="p-4 bg-red-50 rounded text-red-600">
                  {error}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {isLoading ? (
                      Array(4).fill(0).map((_, i) => <NftSkeleton key={i} />)
                    ) : (
                      paginatedNfts.map(nft => (
                        <ErrorBoundary key={nft.id}>
                          <NftCard nft={nft} />
                        </ErrorBoundary>
                      ))
                    )}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isLoading}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isLoading}
                        className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
