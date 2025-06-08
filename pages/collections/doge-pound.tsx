import { useState } from 'react';
import { DogePoundNFT } from '@/lib/constants/dogePoundNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import Image from 'next/image';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchDogePound } from '@/services/dogePoundService';
import { Trait } from '@/types/nft';
import { useQuery } from '@tanstack/react-query';

export default function DogePoundCollection() {
  const [expandedTraits, setExpandedTraits] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch the specific DogePound NFT
  const { data: nft, isLoading, error } = useQuery({
    queryKey: ['dogePound', '8944'],
    queryFn: () => fetchDogePound('8944')
  });

  const collection = COLLECTIONS.find(c => c.name === 'DogePound');
  if (!collection) return null;

  if (isLoading) {
    return (
      <CollectionLayout collection={collection}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </CollectionLayout>
    );
  }

  if (error || !nft) {
    return (
      <CollectionLayout collection={collection}>
        <div className="text-red-500 dark:text-red-400 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
          Failed to load DogePound NFT
        </div>
      </CollectionLayout>
    );
  }

  return (
    <CollectionLayout collection={collection}>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
          Showing DogePound #{nft.tokenId}
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {view === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* NFT Display */}
      <div className={`${view === 'grid' ? 'max-w-lg mx-auto' : 'w-full'}`}>
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative
            ${view === 'list' ? 'flex gap-4 items-center p-4' : ''}`}
        >
          <div className={`relative ${view === 'grid' ? 'aspect-square' : 'w-32 h-32'}`}>
            {nft.imageUrl ? (
              <Image
                src={nft.imageUrl}
                alt={nft.name}
                fill
                className="object-cover"
                priority={true}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">No image</span>
              </div>
            )}
          </div>
          
          <div className={`${view === 'grid' ? 'p-4' : 'flex-1'}`}>
            <h3 className="text-xl font-semibold">{nft.name}</h3>
            {nft.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {nft.description}
              </p>
            )}
            {nft.traits.length > 0 && (
              <div className="mt-2">
                <button 
                  onClick={() => setExpandedTraits(prev => ({
                    ...prev,
                    [nft.tokenId]: !prev[nft.tokenId]
                  }))}
                  className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <span>Traits</span>
                  {expandedTraits[nft.tokenId] ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {expandedTraits[nft.tokenId] && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {nft.traits.map((trait: Trait, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {trait.trait_type}: {trait.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </CollectionLayout>
  );
} 