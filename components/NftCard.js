import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Tooltip } from './Tooltip'

// IPFS gateways in order of preference
const IPFS_GATEWAYS = [
  'https://cloudflare-ipfs.com/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/'
]

const getImageUrl = (ipfsUrl) => {
  if (!ipfsUrl) return ''
  return ipfsUrl.includes('ipfs://')
    ? ipfsUrl.replace('ipfs://', IPFS_GATEWAYS[0])
    : ipfsUrl
}

export default function NftCard({ nft }) {
  const [metadata, setMetadata] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0)
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    const fetchWithFallback = async (uri) => {
      // If the URI ends with an image extension, it's a direct image URL
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(uri)) {
        return {
          image: uri,
          attributes: []
        }
      }

      let lastError = null
      
      // If it's not an IPFS URI, try direct fetch
      if (!uri.includes('ipfs://')) {
        try {
          const res = await fetch(uri)
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return await res.json()
        } catch (err) {
          // If JSON parsing fails, assume it's a direct image URL
          if (err.name === 'SyntaxError') {
            return {
              image: uri,
              attributes: []
            }
          }
          throw new Error(`Failed to fetch from HTTP URL: ${err.message}`)
        }
      }
      
      // Try each IPFS gateway
      const ipfsHash = uri.replace('ipfs://', '')
      for (const gateway of IPFS_GATEWAYS) {
        try {
          const res = await fetch(gateway + ipfsHash)
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return await res.json()
        } catch (err) {
          lastError = err
          console.warn(`Failed to fetch from ${gateway}:`, err)
          continue
        }
      }
      throw lastError || new Error('All IPFS gateways failed')
    }

    const loadMetadata = async () => {
      setIsLoading(true)
      try {
        // If nft.uri is a direct image URL, create a simple metadata object
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(nft.uri)) {
          setMetadata({
            image: nft.uri,
            attributes: []
          })
          setImageUrl(nft.uri)
        } else {
          const data = await fetchWithFallback(nft.uri)
          setMetadata(data)
          if (data.image) {
            setImageUrl(getImageUrl(data.image))
          }
        }
      } catch (err) {
        console.error('Failed to load NFT metadata:', err)
        setError(`Failed to load NFT metadata: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetadata()
  }, [nft.uri])

  const handleImageError = () => {
    if (metadata?.image?.includes('ipfs://')) {
      const nextIndex = currentGatewayIndex + 1
      if (nextIndex < IPFS_GATEWAYS.length) {
        setCurrentGatewayIndex(nextIndex)
        const ipfsHash = metadata.image.replace('ipfs://', '')
        setImageUrl(IPFS_GATEWAYS[nextIndex] + ipfsHash)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="border p-4 rounded-lg shadow-sm animate-pulse">
        <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="border p-4 rounded-lg shadow-sm bg-red-50 dark:bg-red-900">
        <p className="text-red-500 dark:text-red-300 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div 
      className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        {imageUrl && (
          <div className="relative w-full aspect-square">
            <Image
              src={imageUrl}
              alt={nft.title || `NFT #${nft.id}`}
              fill
              className="rounded object-contain"
              priority={nft.id <= 3}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        {showTooltip && metadata && metadata.attributes?.length > 0 && (
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
      <h3 className="font-bold mt-2 text-foreground">{nft.title || `NFT #${nft.id}`}</h3>
      {metadata?.attributes?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {metadata.attributes.slice(0, 3).map(attr => (
            <span 
              key={attr.trait_type}
              className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-muted-foreground"
            >
              {attr.trait_type}: {attr.value}
            </span>
          ))}
          {metadata.attributes.length > 3 && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-muted-foreground">
              +{metadata.attributes.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  )
} 