import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'

const injected = new InjectedConnector({ supportedChainIds: [1, 4, 137] })

export default function WalletButton() {
  const { activate, deactivate, account, active } = useWeb3React()

  const connect = async () => {
    try {
      await activate(injected)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <button onClick={active ? deactivate : connect}>
      {active ? account.substring(0,6) + '…' + account.slice(-4) : 'Connect Wallet'}
    </button>
  )
}

