# KingDAO Treasury Dashboard

A comprehensive dashboard for managing DAO treasury assets, including multi-sig wallets, token balances, and NFT holdings.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Web3 Configuration
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your-project-id
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# Dune Analytics Configuration
DUNE_API_KEY=your-dune-api-key
DUNE_TOKEN_PRICES_QUERY_ID=your-token-prices-query-id
DUNE_NFT_FLOOR_PRICES_QUERY_ID=your-nft-floor-prices-query-id
DUNE_WALLET_BALANCES_QUERY_ID=your-wallet-balances-query-id

# Google Sheets Configuration
GOOGLE_CLIENT_EMAIL=your-service-account-email
GOOGLE_PRIVATE_KEY=your-service-account-private-key
TREASURY_SPREADSHEET_ID=your-spreadsheet-id
```

## Features

- Multi-sig wallet integration with Gnosis Safe
- Real-time token prices and balances from Dune Analytics
- NFT portfolio tracking with floor prices
- Treasury data integration with Google Sheets
- Interactive dashboard with filtering and sorting capabilities

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables as described above
4. Run the development server: `npm run dev`

## Dune Analytics Setup

1. Create the following queries in Dune Analytics:
   - Token Prices Query: Get current prices for ERC20 tokens
   - NFT Floor Prices Query: Get floor prices for NFT collections
   - Wallet Balances Query: Get token balances for specified wallets
2. Copy the query IDs and add them to your environment variables

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

KingDAO.io

- Landing Page with wallet connect

- Token-Gated Access: Only Kong NFT holders can view exclusive pages

- Portfolio Dashboard: Total asset value, cash flows, historical performance charts

- NFT Showcase: Metadata-rich display of user NFTs

- Community Integrations: Discord announcements feed, Snapshot voting overview


Stack
- Frontend: Next.js, React.js, Tailwind CSS

- Blockchain: Ethers.js, Solidity (for any custom contracts)

- API & Data: Moralis or Alchemy, The Graph, Snapshot API, Discord API

- Backend: Node.js, Express (optional for proxy endpoints)

- Database: MongoDB Atlas (optional for caching and rate-limit mitigation)


- Node.js v16+

- A local Ethereum wallet (e.g., MetaMask)

- (Optional) MongoDB Atlas account for caching


git clone git@github.com:Kongtroller/kingdao.io.git
cd kingdao.io
npm install

Create a .env.local file:

NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>
NEXT_PUBLIC_CONTRACT_ADDRESS=<KONG_NFT_CONTRACT_ADDRESS>
MONGODB_URI=<YOUR_MONGODB_URI> # optional

npm run dev

Open -------------- to view.

/components    # Reusable UI components (WalletButton, Chart, Layout)
/pages         # Next.js page routes (index.js, dashboard.js, _app.js)
/services      # API and Web3 interaction logic
/styles        # Global styles and Tailwind config
/utils         # Helper functions and constants
/public        # Static assets (images, icons)

Command / Description

npm run dev / Start development server

npm run build / Build for production

npm run start / Serve production build

npm run lint / Run ESLint checks


Connect the kingdao.io repo to Vercel or Netlify, enable Preview Deploys, and set environment variables in the dashboard.

Fork the repo

Create a feature branch (git checkout -b feature/my-feature)

Commit your changes (git commit -m "feat: my feature")

Push to your branch (git push origin feature/my-feature)

Open a Pull Request

Please follow the existing code style and include relevant tests.

This project is licensed under the MIT License. See LICENSE for details.

