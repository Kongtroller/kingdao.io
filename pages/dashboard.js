// pages/dashboard.js
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import NftCard from '../components/NftCard'
import NftSkeleton from '../components/NftSkeleton'
import { useWeb3Init } from '../hooks/useWeb3Init'

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
      try {
        const balance = await library.getBalance(account)
        setEthBalance(ethers.utils.formatEther(balance))
        
        // Mock data for testing
        setNfts(Array(15).fill(0).map((_, i) => ({
          id: i.toString(),
          uri: 'https://ipfs.io/ipfs/QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1'
        })))
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load portfolio data')
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

  if (error) {
    return <p className="p-4 text-center text-red-500">{error}</p>
  }

  // Main render
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Portfolio Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
          <p className="text-lg">ETH Balance: {ethBalance} ETH</p>
          <p className="text-lg">Kong NFTs: {nfts?.length || 0}</p>
        </div>

        {/* NFT Gallery */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Kong NFTs</h2>
          <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <NftSkeleton key={i} />)
            ) : (
              paginatedNfts.map(nft => <NftCard key={nft.id} nft={nft} />)
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
