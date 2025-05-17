/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY
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
