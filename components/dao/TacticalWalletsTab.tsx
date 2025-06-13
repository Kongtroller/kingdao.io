import { useState } from 'react'
import { useAllMultiSigDetails } from '../../hooks/useMultiSigDetails'
import { TACTICAL_WALLETS, TacticalWalletName } from '../../lib/tacticalWallets'
import { formatCurrency } from '../../utils/format'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../ui/card'
import { Button } from '../ui/button'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '../ui/dialog'
import { PieChart } from 'react-minimal-pie-chart'

interface TokenBalance {
  symbol: string
  balance: string
  usdValue: number
  address: string
}

interface NFTBalance {
  contractAddress: string
  tokenId: string
  name: string
  description: string | null
  tokenUri: string | null
  imageUrl: string | null
  floorPrice: number
  collectionName: string
}

interface WalletDetails {
  tokenBalances: TokenBalance[]
  nftList: NFTBalance[]
  totalUSDValue: number
}

interface WalletCardProps {
  name: TacticalWalletName;
  wallet: typeof TACTICAL_WALLETS[TacticalWalletName];
  details: WalletDetails;
  onClick: () => void;
}

interface WalletDetailViewProps {
  name: TacticalWalletName;
  wallet: typeof TACTICAL_WALLETS[TacticalWalletName];
  details: WalletDetails;
}

export default function TacticalWalletsTab() {
  const [selectedWallet, setSelectedWallet] = useState<TacticalWalletName | null>(null)
  const addresses = Object.values(TACTICAL_WALLETS).map(w => w.address)
  const { data: allWallets, isLoading, error } = useAllMultiSigDetails(addresses)

  console.log('TacticalWalletsTab render:', {
    addresses,
    allWallets,
    isLoading,
    error
  })

  const totalValue = allWallets?.reduce((sum, wallet) => sum + wallet.totalUSDValue, 0) || 0

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="w-full">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error fetching tactical wallets:', error)
    return (
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl text-red-500">Error Loading Tactical Wallets</CardTitle>
          <CardDescription>
            There was an error loading the tactical wallets data. Please try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Total Value */}
      <Card className="w-full">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl">Total Tactical Wallets Value</CardTitle>
          <CardDescription className="text-2xl font-bold">
            {formatCurrency(totalValue)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(TACTICAL_WALLETS).map(([name, wallet], index) => {
          const walletDetails = allWallets?.[index];
          return walletDetails && (
            <WalletCard
              key={wallet.address}
              name={name as TacticalWalletName}
              wallet={wallet}
              details={walletDetails}
              onClick={() => setSelectedWallet(name as TacticalWalletName)}
            />
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedWallet} onOpenChange={() => setSelectedWallet(null)}>
        <DialogContent className="max-w-2xl">
          {selectedWallet && allWallets && (
            <WalletDetailView
              name={selectedWallet}
              wallet={TACTICAL_WALLETS[selectedWallet]}
              details={allWallets.find(w => w.totalUSDValue === allWallets[Object.keys(TACTICAL_WALLETS).indexOf(selectedWallet)].totalUSDValue)!}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WalletCard({ name, wallet, details, onClick }: WalletCardProps) {
  if (!details) return null

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="text-sm">{wallet.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold mb-2">
          {formatCurrency(details.totalUSDValue)}
        </div>
        <div className="text-sm text-muted-foreground">
          {details.tokenBalances.length} tokens • {details.nftList?.length || 0} NFTs
        </div>
      </CardContent>
    </Card>
  )
}

function WalletDetailView({ name, wallet, details }: WalletDetailViewProps) {
  if (!details) return null

  const tokenData = details.tokenBalances.map((token, i) => ({
    title: token.symbol,
    value: token.usdValue,
    color: `hsl(${i * 50}, 70%, 50%)`
  }))

  return (
    <>
      <DialogHeader className="space-y-2">
        <DialogTitle className="text-xl">{name}</DialogTitle>
        <DialogDescription className="text-sm">{wallet.description}</DialogDescription>
      </DialogHeader>
      
      <div className="mt-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="text-2xl font-bold">{formatCurrency(details.totalUSDValue)}</div>
          </div>
          <Button variant="outline" onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}>
            View on Etherscan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token Distribution Chart */}
          <div className="relative h-64">
            <PieChart
              data={tokenData}
              label={({ dataEntry }) => `${dataEntry.title} (${Math.round(dataEntry.percentage)}%)`}
              labelStyle={{
                fontSize: '5px',
                fontFamily: 'sans-serif',
              }}
              labelPosition={80}
            />
          </div>

          {/* Token List */}
          <div className="space-y-2">
            <h4 className="font-medium mb-4">Token Holdings</h4>
            {details.tokenBalances.map((token, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-muted rounded-lg"
              >
                <div>
                  <div className="font-medium">{token.symbol}</div>
                  <div className="text-sm text-muted-foreground">{token.balance}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatCurrency(token.usdValue)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {details.nftList && details.nftList.length > 0 && (
          <div>
            <h4 className="font-medium mb-4">NFT Holdings</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {details.nftList.map((nft, i) => (
                <div key={i} className="p-3 bg-muted rounded-lg">
                  <div className="font-medium">{nft.name}</div>
                  <div className="text-sm text-muted-foreground">ID: {nft.tokenId}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
} 