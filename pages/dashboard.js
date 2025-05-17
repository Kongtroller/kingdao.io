import { useWeb3React } from '@web3-react/core'
import { useEffect } from 'react'
import { ethers } from 'ethers'

export default function Dashboard() {
  const { account, library, active } = useWeb3React()

  useEffect(() => {
    if (active) {
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        [ 'function balanceOf(address) view returns (uint256)' ],
        library
      )
      contract.balanceOf(account).then(balance => {
        if (balance.eq(0)) {
          window.location.href = '/'
        }
      })
    }
  }, [active, account, library])

  if (!active) return <p>Please connect your wallet.</p>
  return <h2>Welcome, Kong Holder!</h2>
}
