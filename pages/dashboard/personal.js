import { useEffect } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '@/components/layouts/DashboardLayout'
import HistoricalPriceChart from '@/components/HistoricalPriceChart'
import RecentSalesSection from '@/components/personal/RecentSalesSection'
import RecentPurchasesSection from '@/components/personal/RecentPurchasesSection'
import KongHoldingsSection from '@/components/personal/KongHoldingsSection'
import LoanPlaceholder from '@/components/personal/LoanPlaceholder'
import { useAccount } from 'wagmi'

export default function PersonalDashboardPage() {
  const router = useRouter()
  const { address: account, isConnected } = useAccount()

  useEffect(() => {
    if (!isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  if (!isConnected) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Price History</h2>
            <HistoricalPriceChart />
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">Recent Sales</h2>
            <RecentSalesSection />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold mb-4">Your Recent Purchases</h2>
          <RecentPurchasesSection />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <KongHoldingsSection />
        </div>

        <LoanPlaceholder />
      </div>
    </DashboardLayout>
  )
} 