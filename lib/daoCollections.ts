export const COLLECTIONS = [
  {
    name: 'Rollbots',
    contract: '0x2f102e69cbce4938cf7fb27adb40fad097a13668',
    logo: '/logos/rollbots.png',
    description: 'Original Rollbots Collection'
  },
  {
    name: 'Sports Rollbots',
    contract: '0x1de7abda2d73a01aa8dca505bdcb773841211daf',
    logo: '/logos/sports-rollbots.png',
    description: 'Sports Edition Rollbots'
  },
  {
    name: 'ZK Race',
    contract: '0x123...', // Replace with actual contract
    logo: '/logos/zk-race.png',
    description: 'ZK Race NFT Collection'
  },
  {
    name: 'KING',
    contract: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
    logo: '/logos/king.png',
    description: 'KING NFT Collection'
  },
  {
    name: 'Wilder World',
    contract: '0x123...', // Replace with actual contract
    logo: '/logos/wilder-world.png',
    description: 'Wilder World NFTs'
  },
  {
    name: 'DogePound',
    contract: '0x123...', // Replace with actual contract
    logo: '/logos/doge-pound.png',
    description: 'DogePound NFTs'
  }
] as const;

export type Collection = typeof COLLECTIONS[number]; 