import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import DAOSummarySection from '../../components/dao/DAOSummarySection'
import NFTCollectionTab from '../../components/dao/NFTCollectionTab'
import CryptoTab from '../../components/dao/CryptoTab'
import MultiSigsTab from '../../components/dao/MultiSigsTab'
import TacticalWalletsTab from '../../components/dao/TacticalWalletsTab'
import { useAccount } from 'wagmi'

export default function DAODashboardPage() {
  const router = useRouter()
  const { address: account, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState<'personal' | 'dao'>('dao')

  useEffect(() => {
    if (!isConnected) {
      router.push('/dashboard')
    }
  }, [isConnected, router])

  const handleTabChange = (value: 'personal' | 'dao') => {
    if (value === 'personal') {
      router.push('/dashboard')
    } else {
      router.push('/dashboard/dao')
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="space-y-8">
        <DAOSummarySection />

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <Tabs defaultValue="tactical" className="w-full">
            <TabsList className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
              <TabsTrigger value="nft" className="px-4 py-2">
                NFT Collection
              </TabsTrigger>
              <TabsTrigger value="crypto" className="px-4 py-2">
                Crypto
              </TabsTrigger>
              <TabsTrigger value="multisigs" className="px-4 py-2">
                Multi-Sigs
              </TabsTrigger>
              <TabsTrigger value="tactical" className="px-4 py-2">
                Tactical Wallets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="nft">
              <NFTCollectionTab />
            </TabsContent>
            <TabsContent value="crypto">
              <CryptoTab />
            </TabsContent>
            <TabsContent value="multisigs">
              <MultiSigsTab />
            </TabsContent>
            <TabsContent value="tactical">
              <TacticalWalletsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  )
} 