// pages/dashboard.js
import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { ethers } from 'ethers'
import { InjectedConnector } from '@web3-react/injected-connector'

// Re-use your injected connector
const injected = new InjectedConnector({ supportedChainIds: [1, 4, 137] })

export default function Dashboard() {
  const { account, active, library, activate } = useWeb3React()
  const router = useRouter()
  const [nfts, setNfts] = useState([])
  const [ethBalance, setEthBalance] = useState('0')

  // If wallet not connected, prompt connection
  useEffect(() => {
    if (!active) {
      activate(injected).catch(() => {
        // if user rejects, send them back home
        router.replace('/')
      })
    }
  }, [active, activate, router])

  // Get ETH balance and NFTs
  useEffect(() => {
    if (active && account && library) {
      // Get ETH balance
      library.getBalance(account).then(balance => {
        setEthBalance(ethers.utils.formatEther(balance))
      })

      // Get NFTs (basic implementation)
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [
          'function balanceOf(address) view returns (uint256)',
          'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
          'function tokenURI(uint256) view returns (string)'
        ],
        library
      )

      contract.balanceOf(account).then(async balance => {
        if (balance.isZero()) {
          router.replace('/')
          return
        }

        const tokens = []
        for (let i = 0; i < balance.toNumber(); i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(account, i)
          const uri = await contract.tokenURI(tokenId)
          tokens.push({ id: tokenId.toString(), uri })
        }
        setNfts(tokens)
      })
    }
  }, [active, account, library])

  // While loading or redirecting…
  if (!active || !account) {
    return <p className="p-4 text-center">Connecting to your wallet…</p>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Portfolio Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Portfolio Summary</h2>
          <p className="text-lg">ETH Balance: {ethBalance} ETH</p>
          <p className="text-lg">Kong NFTs: {nfts.length}</p>
        </div>

        {/* NFT Gallery */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Your Kong NFTs</h2>
          <div className="grid grid-cols-2 gap-4">
            {nfts.map(nft => (
              <div key={nft.id} className="border p-4 rounded">
                <p>Kong #{nft.id}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
