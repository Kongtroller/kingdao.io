import { useState } from 'react'
import { useAllMultiSigDetails, useMultiSigDetails } from '../../hooks/useMultiSigDetails'
import { MULTISIG_WALLETS, MultiSigWalletName } from '../../lib/multiSigWallets'
import { formatCurrency } from '../../utils/format'
import { PieChart } from 'react-minimal-pie-chart'

export default function MultiSigsTab() {
  const [selectedWallet, setSelectedWallet] = useState<MultiSigWalletName | null>(null)
  const addresses = Object.values(MULTISIG_WALLETS).map(w => w.address)
  const { data: allWallets, isLoading } = useAllMultiSigDetails(addresses)

  const totalValue = allWallets?.reduce((sum, wallet) => sum + wallet.totalUSDValue, 0) || 0

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total Value */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Total Multi-Sigs Value
        </h2>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(totalValue)}
        </p>
      </div>

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(MULTISIG_WALLETS).map(([name, wallet], index) => (
          <WalletCard
            key={wallet.address}
            name={name as MultiSigWalletName}
            wallet={wallet}
            details={allWallets?.[index]}
            onClick={() => setSelectedWallet(name as MultiSigWalletName)}
          />
        ))}
      </div>

      {/* Detail Panel */}
      {selectedWallet && (
        <MultiSigDetailView
          name={selectedWallet}
          address={MULTISIG_WALLETS[selectedWallet].address}
          onClose={() => setSelectedWallet(null)}
        />
      )}
    </div>
  )
}

function WalletCard({ name, wallet, details, onClick }) {
  if (!details) return null

  return (
    <div
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {wallet.description}
      </p>
      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {formatCurrency(details.totalUSDValue)}
      </p>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {details.tokenBalances.length} tokens • {details.nftList.length} NFTs
      </div>
    </div>
  )
}

export function MultiSigDetailView({ name, address, onClose }) {
  const { data: details, isLoading } = useMultiSigDetails(address)

  if (isLoading || !details) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  const tokenValue = details.tokenBalances.reduce((sum, token) => sum + token.usdValue, 0)
  const nftValue = details.nftList.reduce((sum, nft) => sum + nft.floorPrice, 0)
  const totalValue = tokenValue + nftValue

  const pieData = [
    { title: 'ERC-20 Tokens', value: tokenValue, color: '#3B82F6' },
    { title: 'NFTs', value: nftValue, color: '#10B981' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Total Value: {formatCurrency(totalValue)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Value Distribution */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Value Distribution
          </h3>
          <div className="flex items-center space-x-8">
            <div className="w-32 h-32">
              <PieChart
                data={pieData}
                lineWidth={20}
                paddingAngle={2}
                rounded
                label={({ dataEntry }) =>
                  Math.round((dataEntry.value / totalValue) * 100) + '%'
                }
                labelStyle={{ fontSize: '8px' }}
              />
            </div>
            <div className="space-y-2">
              {pieData.map((item) => (
                <div key={item.title} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {item.title}: {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Token Balances */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Token Balances
          </h3>
          <div className="space-y-3">
            {details.tokenBalances.map((token) => (
              <div
                key={token.address}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600 dark:text-gray-300">
                  {token.symbol}
                </span>
                <div className="text-right">
                  <div className="text-gray-900 dark:text-gray-100">
                    {formatCurrency(token.usdValue)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {parseFloat(token.balance).toFixed(4)} {token.symbol}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* NFT Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            NFTs
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {details.nftList.map((nft) => (
              <div
                key={`${nft.contractAddress}-${nft.tokenId}`}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2"
              >
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-2" />
                )}
                <div className="text-sm">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {nft.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Floor: {formatCurrency(nft.floorPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 