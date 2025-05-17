// components/WalletButton.js

import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

// Instantiate once: which chains your app supports (Mainnet, Rinkeby, Polygon)
const injected = new InjectedConnector({ supportedChainIds: [1, 4, 137] })

export default function WalletButton() {
  // 1) Prevent SSR errors: only call hook after client mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // 2) Now safe to use hook inside client
  const { activate, deactivate, account, active } = useWeb3React()

  // 3) While waiting for client mount, show a disabled placeholder
  if (!mounted) {
    return (
      <button disabled className="px-4 py-2 bg-gray-500 text-white rounded">
        Loading...
      </button>
    )
  }

  // 4) Define connect/disconnect handlers
  const connect = async () => {
    try {
      await activate(injected)  // Prompt MetaMask to connect
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  // 5) Render the button: shows address if connected, else "Connect Wallet"
  return (
    <button
      onClick={active ? deactivate : connect}
      className="px-4 py-2 bg-primary text-bg rounded hover:opacity-90 transition"
    >
      {active
        ? `${account.substring(0, 6)}…${account.slice(-4)}`  // e.g. "0x1234…ABCD"
        : 'Connect Wallet'}
    </button>
  )
}
