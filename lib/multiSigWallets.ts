export const MULTISIG_WALLETS = {
  'DAO Treasury': {
    address: '0xde27cbE0DdfaDF1C8C27fC8e43f7e713DD1B23cF',
    description: 'Main DAO treasury for governance and operations'
  },
  'Reward Pool': {
    address: '0x24901F1b9b41e853778107CD737cC426b456fC95',
    description: 'Holds rewards for staking and community incentives'
  },
  'Development Fund': {
    address: '0x00239b99703b773B0A1B6A33f4691867aF071d5A',
    description: 'Funds allocated for protocol development'
  },
  'Marketing Fund': {
    address: '0x7F40aD6ED8B9D510AF3BF31367E56CFeA3dc3d9C',
    description: 'Budget for marketing and community growth'
  }
} as const

export type MultiSigWalletName = keyof typeof MULTISIG_WALLETS
export type MultiSigWallet = typeof MULTISIG_WALLETS[MultiSigWalletName]

export function getMultiSigAddresses(): string[] {
  return Object.values(MULTISIG_WALLETS).map(wallet => wallet.address)
} 