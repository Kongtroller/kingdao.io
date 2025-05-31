import { useQuery } from '@tanstack/react-query'
import { alchemy } from '../lib/web3/provider'
import { OwnedNft, GetFloorPriceResponse } from 'alchemy-sdk'

interface NFTWithFloorPrice extends OwnedNft {
  floorPrice?: number
}

export function useNFTs(address: string, contractAddresses?: string[]) {
  return useQuery({
    queryKey: ['nfts', address, contractAddresses],
    queryFn: async () => {
      try {
        const response = await alchemy.nft.getNftsForOwner(address, {
          contractAddresses
        })

        // Fetch floor prices in parallel
        const nftsWithFloorPrice = await Promise.all(
          response.ownedNfts.map(async (nft) => {
            try {
              const floorPrice = await alchemy.nft.getFloorPrice(nft.contract.address)
              // The response type is complex, but we know OpenSea floor price is accessible this way
              const openSeaFloorPrice = (floorPrice as any)?.openSea?.floorPrice || 0
              return {
                ...nft,
                floorPrice: openSeaFloorPrice
              }
            } catch (error) {
              console.error('Error fetching floor price:', error)
              return {
                ...nft,
                floorPrice: 0
              }
            }
          })
        )

        return nftsWithFloorPrice
      } catch (error) {
        console.error('Error fetching NFTs:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
} 