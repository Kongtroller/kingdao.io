module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_MORALIS_APP_ID: process.env.NEXT_PUBLIC_MORALIS_APP_ID,
    NEXT_PUBLIC_MORALIS_SERVER_URL: process.env.NEXT_PUBLIC_MORALIS_SERVER_URL
  },
  images: {
    domains: ['your-ipfs-gateway.com', 'raw.githubusercontent.com']
  }
}
