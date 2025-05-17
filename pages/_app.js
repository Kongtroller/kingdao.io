// pages/_app.js

import '../styles/globals.css'                  // Global CSS (Tailwind + custom resets)
import { Web3ReactProvider } from '@web3-react/core'  
import { ethers } from 'ethers'                 
import Layout from '../components/Layout'       

// Fix the getLibrary function
function getLibrary(provider) {
  // Return null if no provider is passed (prevents SSR issues)
  if (!provider) return null
  return new ethers.providers.Web3Provider(provider, 'any')
}

function MyApp({ Component, pageProps }) {
  return (
    // Web3ReactProvider makes the Web3 context available to all children
    <Web3ReactProvider getLibrary={getLibrary}>
      {/* Layout wraps every page with header/footer */}
      <Layout>
        {/* page-level component (index.js, dashboard.js, etc.) */}
        <Component {...pageProps} />
      </Layout>
    </Web3ReactProvider>
  )
}

export default MyApp
