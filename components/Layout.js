// components/Layout.js

import { useWeb3React } from '@web3-react/core'

export default function Layout({ children }) {
  const { account, deactivate } = useWeb3React()

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">KingDAO</h1>
          {account ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button
                onClick={deactivate}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Disconnect
              </button>
            </div>
          ) : null}
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
