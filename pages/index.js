import WalletButton from '../components/WalletButton'
import { useWeb3React } from '@web3-react/core'

export default function Home() {
  const { account } = useWeb3React()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to KingDAO</h1>
      <p className="mb-8 text-lg text-fg/75">
        A minimalistic, futuristic Web3 dashboard for Kong NFT holders.
      </p>
      <WalletButton />
      {account && (
        <a 
          href="/dashboard" 
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </a>
      )}
    </div>
  )
}
