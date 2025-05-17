import React, { useState, useEffect } from 'react'
import ImageWithFallback from './ImageWithFallback'
import NftSkeleton from './NftSkeleton'

export default function NftCard({ nft }) {
  const [metadata, setMetadata] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setIsLoading(true)
    fetch(nft.uri)
      .then(res => res.json())
      .then(setMetadata)
      .catch(err => {
        console.error(err)
        setError('Failed to load NFT metadata')
      })
      .finally(() => setIsLoading(false))
  }, [nft.uri])

  if (isLoading) {
    return <NftSkeleton />
  }

  if (error) {
    return (
      <div className="border p-4 rounded-lg shadow-sm bg-red-50">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {metadata?.image && (
        <ImageWithFallback 
          src={metadata.image} 
          alt={`Kong #${nft.id}`}
          className="w-full h-48 object-cover rounded mb-2"
        />
      )}
      <h3 className="font-bold">Kong #{nft.id}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {metadata?.attributes?.map(attr => (
          <span 
            key={attr.trait_type} 
            className="text-sm bg-gray-100 px-2 py-1 rounded"
          >
            {attr.trait_type}: {attr.value}
          </span>
        ))}
      </div>
    </div>
  )
} 