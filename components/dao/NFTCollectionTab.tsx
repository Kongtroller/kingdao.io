import { useState } from 'react'
import Image from 'next/image'
import { COLLECTIONS } from '../../lib/daoCollections'
import { useDaoCollectionDetails } from '../../hooks/useDaoCollectionDetails'
import { formatCurrency } from '../../utils/format'

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
              p-4 rounded-lg border transition-all
              ${selectedCollection === collection.contract
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <Image
                  src={collection.logo}
                  alt={collection.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{collection.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {collection.description}
                </p>
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

              <div className="space-y-2">
                <h4 className="font-medium">Holdings</h4>
                {details.holdings.map((holding, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-background rounded-lg"
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