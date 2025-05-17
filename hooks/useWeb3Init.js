import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

const injected = new InjectedConnector({ supportedChainIds: [1] })

export function useWeb3Init() {
  const { active, activate } = useWeb3React()
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!tried && typeof window !== 'undefined') {
      activate(injected).catch(() => {
        setTried(true)
      })
    }
  }, [activate, tried])

  // handle the case where the user has already connected their wallet
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
} 