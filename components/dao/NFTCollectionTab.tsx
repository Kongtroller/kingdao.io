import { useState } from 'react'
import Image from 'next/image'
import { COLLECTIONS } from '../../lib/daoCollections'
import { useDaoCollectionDetails } from '../../hooks/useDaoCollectionDetails'
import { formatCurrency } from '../../utils/format'
import { ExternalLink } from 'lucide-react'

export default function NFTCollectionTab() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const details = useDaoCollectionDetails(selectedCollection || '')

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {COLLECTIONS.map((collection) => (
          <button
            key={collection.contract}
            onClick={() => setSelectedCollection(
              selectedCollection === collection.contract ? null : collection.contract
            )}
            className={`
              relative overflow-hidden rounded-lg border transition-all
              ${selectedCollection === collection.contract
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
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
            <div className="bg-card rounded-lg p-6 space-y-4">
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

              {/* Holdings */}
              <div>
                <h4 className="font-medium mb-4">Holdings</h4>
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