KingDAO.io

- Landing Page with wallet connect

- Token-Gated Access: Only Kong NFT holders can view exclusive pages

- Portfolio Dashboard: Total asset value, cash flows, historical performance charts

- NFT Showcase: Metadata-rich display of user NFTs

- Community Integrations: Discord announcements feed, Snapshot voting overview



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

