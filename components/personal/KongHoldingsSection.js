import { useState, useEffect } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { ethers } from 'ethers'
import NftCard from '@/components/NftCard'
import NftSkeleton from '@/components/NftSkeleton'
import config from '@/config/config'

const ITEMS_PER_PAGE = 8

export default function KongHoldingsSection() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const [nfts, setNfts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadNfts = async () => {
      if (!address) return
      setIsLoading(true)
      try {
        const provider = publicClient ? new ethers.providers.Web3Provider(publicClient) : ethers.getDefaultProvider()
        const contract = new ethers.Contract(
          config.NFTcontract,
          [
            'function balanceOf(address) view returns (uint256)',
            'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
            'function tokenURI(uint256) view returns (string)'
          ],
          provider
        )

        const balance = await contract.balanceOf(address)
        const tokenPromises = []

        for (let i = 0; i < balance.toNumber(); i++) {
          tokenPromises.push(
            contract.tokenOfOwnerByIndex(address, i)
              .then(async tokenId => {
                const uri = await contract.tokenURI(tokenId)
                return { id: tokenId.toString(), uri }
              })
          )
        }

        const tokens = await Promise.all(tokenPromises)
        setNfts(tokens)
      } catch (err) {
        console.error('Failed to load NFTs:', err)
        setError('Failed to load your Kong NFTs')
      } finally {
        setIsLoading(false)
      }
    }

    loadNfts()
  }, [address, publicClient])

  const totalPages = Math.ceil((nfts || []).length / ITEMS_PER_PAGE)
  const paginatedNfts = nfts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
          <NftSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
        {error}
      </div>
    )
  }

  if (!nfts.length) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
        No Kong NFTs found in your wallet
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Your Collection
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {nfts.length} Kong{nfts.length === 1 ? '' : 's'} in your wallet
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedNfts.map((nft) => (
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
                  ? 'bg-primary text-white dark:bg-primary-dark'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
} 