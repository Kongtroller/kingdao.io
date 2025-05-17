/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    
    // Dune Analytics API Keys
    DUNE_NFT_FLOOR_PRICE_API: process.env.DUNE_NFT_FLOOR_PRICE_API,
    DUNE_NFT_TOKEN_PRICES_API: process.env.DUNE_NFT_TOKEN_PRICES_API,
    DUNE_WALLET_BALANCES_API: process.env.DUNE_WALLET_BALANCES_API
  },
  images: {
    domains: [
      'ipfs.moralis.io', 
      'ipfs.io', 
      'raw.githubusercontent.com',
      'gateway.ipfs.io',
      'gateway.pinata.cloud',
      'cloudflare-ipfs.com',
      'ipfs.infura.io'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  }
}

module.exports = nextConfig
