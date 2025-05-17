/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    DUNE_API_KEY: process.env.DUNE_API_KEY,
    NEXT_PUBLIC_DUNE_TOKEN_PRICES_QUERY_ID: process.env.NEXT_PUBLIC_DUNE_TOKEN_PRICES_QUERY_ID,
    NEXT_PUBLIC_DUNE_NFT_FLOOR_PRICES_QUERY_ID: process.env.NEXT_PUBLIC_DUNE_NFT_FLOOR_PRICES_QUERY_ID,
    NEXT_PUBLIC_DUNE_WALLET_BALANCES_QUERY_ID: process.env.NEXT_PUBLIC_DUNE_WALLET_BALANCES_QUERY_ID
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
