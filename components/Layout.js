// components/Layout.js

import WalletButton from './WalletButton'  // The connect/disconnect UI

export default function Layout({ children }) {
  return (
    <>
      {/* Header with site title and wallet button */}
      <header className="flex items-center justify-between p-4 bg-bg">
        <h1 className="text-xl font-bold text-primary">KingDAO</h1>
        <WalletButton />
      </header>

      {/* Main content injected from pages */}
      <main className="p-4 bg-bg text-fg">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-4 bg-bg text-center text-sm text-fg/75">
        © {new Date().getFullYear()} KingDAO
      </footer>
    </>
  )
}
