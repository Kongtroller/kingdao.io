import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { COLLECTIONS } from '../../lib/daoCollections'
import { useDaoCollectionDetails } from '../../hooks/useDaoCollectionDetails'
import { formatCurrency } from '../../utils/format'
import { ExternalLink } from 'lucide-react'

export default function NFTCollectionTab() {
  const router = useRouter()
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const details = useDaoCollectionDetails(selectedCollection || '')

  const handleCollectionClick = (collection: typeof COLLECTIONS[number]) => {
    // Navigate to the dedicated collection page
    router.push(`/collections/${collection.name.toLowerCase().replace(/\s+/g, '-')}`)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COLLECTIONS.map((collection) => (
          <button
            key={collection.contract}
            onClick={() => handleCollectionClick(collection)}
            className="relative overflow-hidden rounded-lg border transition-all border-border hover:border-primary/50"
          >
            {/* Banner Image */}
            <div className="relative w-full h-32">
              <Image
                src={collection.banner}
                alt={`${collection.name} banner`}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  // Fallback to a default banner image
                  e.currentTarget.src = '/images/placeholder-banner.jpg'
                }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                {/* Logo */}
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-background">
                  <Image
                    src={collection.logo}
                    alt={collection.name}
                    fill
                    className="object-contain"
                    priority
                    onError={(e) => {
                      // Fallback to a default logo image
                      e.currentTarget.src = '/images/placeholder-logo.jpg'
                    }}
                  />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{collection.name}</h3>
                    {collection.website && (
                      <a 
                        href={collection.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Collection Details */}
      {selectedCollection && (
        <div className="mt-8 animate-in fade-in slide-in-from-top-4">
          {details.isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : details.error ? (
            <div className="text-destructive text-center p-4">
              {details.error}
            </div>
          ) : (
            <div className="bg-card rounded-lg p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground">Total NFTs</div>
                  <div className="text-2xl font-semibold">{details.totalNfts}</div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground">Floor Price</div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(details.floorPrice)}
                  </div>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-2xl font-semibold">
                    {formatCurrency(details.totalValue)}
                  </div>
                </div>
              </div>

              {/* NFT Showcase */}
              <div>
                <h4 className="font-medium mb-4">NFT Showcase</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {details.holdings.map(holding => (
                    holding.nfts.map(nft => (
                      <div
                        key={`${holding.wallet}-${nft.tokenId}`}
                        className="bg-background rounded-lg overflow-hidden"
                      >
                        {/* NFT Image */}
                        <div className="relative aspect-square">
                          {nft.imageUrl ? (
                            <Image
                              src={nft.imageUrl}
                              alt={nft.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No Image</span>
                            </div>
                          )}
                        </div>

                        {/* NFT Details */}
                        <div className="p-3">
                          <h5 className="font-medium truncate" title={nft.name}>
                            {nft.name}
                          </h5>
                          <p className="text-sm text-muted-foreground truncate">
                            Token ID: {nft.tokenId}
                          </p>
                        </div>

                        {/* Traits Preview */}
                        {nft.traits && nft.traits.length > 0 && (
                          <div className="px-3 pb-3">
                            <div className="flex flex-wrap gap-1">
                              {nft.traits.slice(0, 3).map((trait, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5"
                                  title={`${trait.trait_type}: ${trait.value}`}
                                >
                                  {trait.value}
                                </span>
                              ))}
                              {nft.traits.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{nft.traits.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ))}
                </div>
              </div>

              {/* Holdings */}
              <div>
                <h4 className="font-medium mb-4">Holdings by Wallet</h4>
                {details.holdings.map((holding, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-background rounded-lg mb-2"
                  >
                    <div className="text-sm">{holding.wallet}</div>
                    <div className="font-medium">{holding.balance} NFTs</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 