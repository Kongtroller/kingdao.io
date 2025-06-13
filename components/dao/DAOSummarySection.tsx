import { useState, useEffect } from 'react'
import { getMultiSigBalances } from '../../services/walletService'
import { getDaoWalletAddresses } from '../../lib/daoWallets'
import { formatCurrency } from '../../lib/format'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { Pie } from 'react-chartjs-2'
import Spinner from '../common/Spinner'
import ErrorBanner from '../common/ErrorBanner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../ui/card'
import { cn } from '../../lib/utils'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

interface WalletBalance {
  address: string
  tokenBalances: Array<{
    symbol: string
    balance: string
    usdValue: number
    address: string
  }>
  totalValue: number
  error?: string
}

export default function DAOSummarySection() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState(0)
  const [summaryData, setSummaryData] = useState({
    nftValue: 0,
    cryptoValue: 0,
    multiSigValue: 0,
    tacticalValue: 0
  })

  useEffect(() => {
    async function loadSummaryData() {
      try {
        setLoading(true)
        setError(null)

        const addresses = getDaoWalletAddresses()
        const balances = await getMultiSigBalances(addresses)

        // Ensure balances is an array
        const balancesArray = Array.isArray(balances) ? balances : [balances]

        // Check if any wallet had an error
        const errors = balancesArray.filter(b => b?.error)
        if (errors.length > 0) {
          setError('Some wallet balances could not be loaded')
        }

        // Calculate total value even if some wallets failed
        const total = balancesArray.reduce((sum, b) => sum + (b?.totalValue || 0), 0)
        setTotalValue(total)

        // Set summary data
        setSummaryData({
          nftValue: 0, // Will be implemented later
          cryptoValue: total * 0.4, // Placeholder distribution
          multiSigValue: total * 0.4,
          tacticalValue: total * 0.2
        })
      } catch (error) {
        console.error('Failed to load DAO summary:', error)
        setError('Failed to load DAO summary data')
      } finally {
        setLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  const chartData = {
    labels: ['NFTs', 'Crypto', 'Multi-Sigs', 'Tactical'],
    datasets: [{
      data: [
        summaryData.nftValue,
        summaryData.cryptoValue,
        summaryData.multiSigValue,
        summaryData.tacticalValue
      ],
      backgroundColor: [
        'var(--color-chart-1)',
        'var(--color-chart-2)',
        'var(--color-chart-3)',
        'var(--color-chart-4)'
      ],
      borderColor: [
        'var(--color-chart-1)',
        'var(--color-chart-2)',
        'var(--color-chart-3)',
        'var(--color-chart-4)'
      ],
      borderWidth: 1
    }]
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      {error && (
        <CardContent className="pb-0">
          <ErrorBanner message={error} />
        </CardContent>
      )}
      
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">DAO Treasury Overview</CardTitle>
        <CardDescription className="text-sm">
          Total Value: {formatCurrency(totalValue)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                Total Value
              </h3>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(totalValue)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">NFTs</span>
                <span className="font-medium text-card-foreground">{formatCurrency(summaryData.nftValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Crypto</span>
                <span className="font-medium text-card-foreground">{formatCurrency(summaryData.cryptoValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multi-Sigs</span>
                <span className="font-medium text-card-foreground">{formatCurrency(summaryData.multiSigValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tactical</span>
                <span className="font-medium text-card-foreground">{formatCurrency(summaryData.tacticalValue)}</span>
              </div>
            </div>
          </div>

          <div className="relative h-64">
            <Pie 
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: 'var(--color-muted-foreground)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 