import WalletButton from '../components/WalletButton'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <h1 className="text-4xl font-bold mb-4 text-primary">Welcome to KingDAO</h1>
      <p className="mb-8 text-lg text-fg/75">
        A minimalistic, futuristic Web3 dashboard for Kong NFT holders.
      </p>
      <WalletButton />
    </div>
  )
}
