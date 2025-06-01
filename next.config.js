/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    MORALIS_API_KEY: process.env.MORALIS_API_KEY,
    
    // Dune Analytics API Keys
    DUNE_API_KEY: process.env.DUNE_API_KEY,
    DUNE_FLOOR_PRICE_QUERY_ID: process.env.DUNE_FLOOR_PRICE_QUERY_ID,
    DUNE_RECENT_SALES_QUERY_ID: process.env.DUNE_RECENT_SALES_QUERY_ID,
    DUNE_WALLET_BALANCES_QUERY_ID: process.env.DUNE_WALLET_BALANCES_QUERY_ID,
    DUNE_HISTORICAL_PRICES_QUERY_ID: process.env.DUNE_HISTORICAL_PRICES_QUERY_ID
  },
  images: {
    domains: [
      'ipfs.moralis.io', 
      'ipfs.io', 
      'raw.githubusercontent.com',
      'gateway.ipfs.io',
      'gateway.pinata.cloud',
      'cloudflare-ipfs.com',
      'ipfs.infura.io',
      'nft-cdn.alchemy.com',
      'res.cloudinary.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
