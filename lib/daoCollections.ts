export const COLLECTIONS = [
  {
    name: 'Rollbots',
    contract: '0x2f102e69cbce4938cf7fb27adb40fad097a13668',
    logo: '/collections/rollbots-logo.png',
    banner: '/collections/rollbots-banner.jpg',
    description: 'A collection of 10,000 unique robots generated algorithmically using over 600 traits with proof of ownership on the Ethereum blockchain.',
    website: 'https://rollbots.io'
  },
  {
    name: 'Sports Rollbots',
    contract: '0x1de7abda2d73a01aa8dca505bdcb773841211daf',
    logo: '/collections/sports-rollbots-logo.png',
    banner: '/collections/sports-rollbots-banner.jpg',
    description: 'Sports-themed robots that double as VIP membership for Rollbit\'s sportsbook. Each Rollbot grants unique perks and rewards.',
    website: 'https://rollbots.io/sports'
  },
  {
    name: 'ZK Race',
    contract: '0x123...', // Replace with actual contract
    logo: '/collections/zk-race-logo.png',
    banner: '/collections/zk-race-banner.jpg',
    description: 'High-speed racing NFTs with ZK technology. Race, compete and earn rewards.',
    website: 'https://zkrace.game'
  },
  {
    name: 'KING',
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    logo: '/collections/king-logo.png',
    banner: '/collections/king-banner.jpg',
    description: 'The official NFT collection of KingDAO, granting governance rights and exclusive benefits.',
    website: 'https://kingdao.io'
  },
  {
    name: 'Wilder World',
    contract: '0x123...', // Replace with actual contract
    logo: '/collections/wilder-world-logo.png',
    banner: '/collections/wilder-world-banner.jpg',
    description: 'Immersive 5D Metaverse NFTs. Own and trade digital assets in a photorealistic universe.',
    website: 'https://wilderworld.com'
  },
  {
    name: 'DogePound',
    contract: '0x123...', // Replace with actual contract
    logo: '/collections/doge-pound-logo.png',
    banner: '/collections/doge-pound-banner.jpg',
    description: 'The original DogePound NFT collection featuring unique dog-themed artwork and utility.',
    website: 'https://thedogepoundnft.com'
  }
] as const;

export type Collection = typeof COLLECTIONS[number]; 