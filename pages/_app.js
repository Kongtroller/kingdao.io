import '../styles/globals.css'
import { Web3ReactProvider } from '@web3-react/core'
import { ethers } from 'ethers'
import Layout from '../components/Layout'

function getLibrary(provider) {
  return new ethers.providers.Web3Provider(provider)
}

export default function App({ Component, pageProps }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Web3ReactProvider>
  )
}
