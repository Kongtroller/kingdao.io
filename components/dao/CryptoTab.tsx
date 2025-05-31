import { useDaoCryptoCategory, useDaoCryptoTotal } from '../../hooks/useDaoCryptoCategory'
import { TOKEN_CATEGORIES, TokenCategory } from '../../lib/daoWallets'
import { formatCurrency } from '../../utils/format'

export default function CryptoTab() {
  const { data: totalValue, isLoading: isTotalLoading } = useDaoCryptoTotal()

  return (
    <div className="space-y-6">
      {/* Total Value Summary */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          DAO Crypto Total Value
        </h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isTotalLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            formatCurrency(totalValue || 0)
          )}
        </p>
      </div>

      {/* Categories */}
      <div className="grid gap-6">
        {Object.keys(TOKEN_CATEGORIES).map((category) => (
          <CategoryCard key={category} category={category as TokenCategory} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ category }: { category: TokenCategory }) {
  const { data: tokens, isLoading } = useDaoCryptoCategory(category)

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm animate-pulse">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    )
  }

  const totalValue = tokens?.reduce((sum, token) => sum + token.usdValue, 0) || 0

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {category}
        </h3>
        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {formatCurrency(totalValue)}
        </p>
      </div>

      <div className="space-y-3">
        {tokens?.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center space-x-2">
              {token.iconUrl && (
                <img
                  src={token.iconUrl}
                  alt={token.symbol}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span className="text-gray-600 dark:text-gray-300">
                {token.symbol}
              </span>
            </div>
            <div className="text-right">
              <div className="text-gray-900 dark:text-gray-100">
                {formatCurrency(token.usdValue)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {parseFloat(token.totalBalance).toFixed(4)} {token.symbol}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 