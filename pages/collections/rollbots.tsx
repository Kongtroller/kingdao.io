import { useState, useEffect } from 'react';
import { MANUAL_ROLLBOTS, RollbotNFT } from '@/lib/constants/rollbotsNFTs';
import { COLLECTIONS } from '@/lib/daoCollections';
import Image from 'next/image';
import CollectionLayout from '@/components/layouts/CollectionLayout';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp, Crown } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

interface TraitStats {
  [traitType: string]: {
    values: { [value: string]: number };
    count: number;
  };
}

const RollbotsCollection = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [traitStats, setTraitStats] = useState<TraitStats>({});
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState<{ [key: string]: boolean }>({});
  const { ref, inView } = useInView();

  const collection = COLLECTIONS.find(c => c.name === 'Rollbots')!;
  
  // Calculate trait statistics
  useEffect(() => {
    const stats: TraitStats = {};
    MANUAL_ROLLBOTS.forEach(bot => {
      bot.traits.forEach(trait => {
        if (!stats[trait.trait_type]) {
          stats[trait.trait_type] = { values: {}, count: 0 };
        }
        if (!stats[trait.trait_type].values[trait.value]) {
          stats[trait.trait_type].values[trait.value] = 0;
        }
        stats[trait.trait_type].values[trait.value]++;
        stats[trait.trait_type].count++;
      });
    });
    setTraitStats(stats);
  }, []);

  // Handle infinite scroll
  useEffect(() => {
    if (inView) {
      setDisplayedCount(prev => 
        Math.min(prev + ITEMS_PER_PAGE, MANUAL_ROLLBOTS.length)
      );
    }
  }, [inView]);

  const filteredRollbots = MANUAL_ROLLBOTS.filter(bot => 
    bot.tokenId.includes(searchQuery) || 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedRollbots = filteredRollbots.slice(0, displayedCount);

  return (
    <CollectionLayout collection={collection}>
      {/* Stats Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <button 
          onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          className="w-full flex justify-between items-center"
        >
          <h2 className="text-xl font-semibold">Trait Statistics</h2>
          {isStatsExpanded ? (
            <ChevronUp className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {isStatsExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {Object.entries(traitStats).map(([traitType, { values, count }]) => (
              <div key={traitType} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium mb-2">{traitType}</h3>
                <div className="space-y-2">
                  {Object.entries(values)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([value, frequency]) => (
                      <div key={value} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
                        <span className="text-sm font-medium">
                          {((frequency / count) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
          Showing {displayedRollbots.length} of {filteredRollbots.length} NFTs
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by ID or name..."
            className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {view === 'grid' ? 'List View' : 'Grid View'}
          </button>
        </div>
      </div>

      {/* Collection Grid */}
      <div className={`grid ${view === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
        {displayedRollbots.map((rollbot) => (
          <div 
            key={rollbot.tokenId}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden relative
              ${view === 'list' ? 'flex gap-4 items-center p-4' : ''}`}
          >
            {/* KING DAO Badge */}
            <div className="absolute top-2 right-2 z-10">
              <div className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg transition-colors cursor-pointer">
                <Crown className="w-3 h-3" />
                <span>KING DAO</span>
              </div>
            </div>

            <div className={`relative ${view === 'grid' ? 'aspect-square' : 'w-32 h-32'}`}>
              <Image
                src={rollbot.imageUrl}
                alt={rollbot.name}
                fill
                className="object-cover"
                onError={(e) => {
                  // @ts-ignore
                  e.target.onerror = null;
                  // @ts-ignore
                  e.target.src = '/images/placeholder-nft.svg';
                }}
                unoptimized
              />
            </div>
            <div className={`p-4 ${view === 'list' ? 'flex-1' : ''}`}>
              <h3 className="text-xl font-semibold">{rollbot.name}</h3>
              {rollbot.traits.length > 0 && (
                <div className="mt-2">
                  <button 
                    onClick={() => setExpandedTraits(prev => ({
                      ...prev,
                      [rollbot.tokenId]: !prev[rollbot.tokenId]
                    }))}
                    className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    <span>Traits</span>
                    {expandedTraits[rollbot.tokenId] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedTraits[rollbot.tokenId] && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rollbot.traits.map((trait, index) => (
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
        ))}
      </div>

      {/* Infinite Scroll Trigger */}
      {displayedCount < filteredRollbots.length && (
        <div
          ref={ref}
          className="flex justify-center items-center p-8"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      )}
    </CollectionLayout>
  );
};

export default RollbotsCollection;