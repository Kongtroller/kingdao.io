import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Tooltip } from './Tooltip'

export default function NftCard({ nft }) {
  const [metadata, setMetadata] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoading(true)
      try {
        // Handle both IPFS and HTTP URIs
        const uri = nft.uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
        const res = await fetch(uri)
        const data = await res.json()
        setMetadata(data)
      } catch (err) {
        console.error('Failed to load NFT metadata:', err)
        setError('Failed to load NFT metadata')
      } finally {
        setIsLoading(false)
      }
    }

    loadMetadata()
  }, [nft.uri])

  if (isLoading) {
    return (
      <div className="border p-4 rounded-lg shadow-sm animate-pulse">
        <div className="w-full h-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="border p-4 rounded-lg shadow-sm bg-red-50">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div 
      className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        {metadata?.image && (
          <div className="relative w-full h-48">
            <Image
              src={metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
              alt={`Kong #${nft.id}`}
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          </div>
        )}
        {showTooltip && metadata && (
          <Tooltip>
            <div className="p-2">
              <h4 className="font-bold mb-2">Attributes</h4>
              {metadata.attributes?.map(attr => (
                <div key={attr.trait_type} className="text-sm">
                  <span className="font-medium">{attr.trait_type}:</span> {attr.value}
                </div>
              ))}
            </div>
          </Tooltip>
        )}
      </div>
      <h3 className="font-bold mt-2">Kong #{nft.id}</h3>
      <div className="mt-2 flex flex-wrap gap-1">
        {metadata?.attributes?.slice(0, 3).map(attr => (
          <span 
            key={attr.trait_type}
            className="text-xs bg-gray-100 px-2 py-1 rounded"
          >
            {attr.trait_type}: {attr.value}
          </span>
        ))}
        {metadata?.attributes?.length > 3 && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            +{metadata.attributes.length - 3} more
          </span>
        )}
      </div>
    </div>
  )
} 