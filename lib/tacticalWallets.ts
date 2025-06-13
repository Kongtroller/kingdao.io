export const TACTICAL_WALLETS = {
  'Kongtroller': {
    address: '0xd8a7113A701A4ECcC5F8Aa85a621Ac42104D6Eb8', // Replace with actual Kongtroller wallet
    description: 'Main operational wallet for Kong-related activities'
  },
  'Vulcan Forged': {
    address: '0x0c0cD255b2b6cc5423Cc3BdB0CC1B07DAcFCa83F', // Replace with actual Vulcan Forged wallet
    description: 'Dedicated wallet for Vulcan Forged gaming ecosystem'
  },
  'WilderWorld': {
    address: '0x8CC04643143caFa204b2797459AA3cb82cd41283', // Replace with actual WilderWorld wallet
    description: 'Manages WilderWorld metaverse assets and operations'
  },
  'ZK Race': {
    address: '0x1C0F0b94B3130Bd7F3c93417D4c19e9E80C56f74', // Replace with actual WilderWorld wallet
    description: 'Manages ZK Race assets and operations'
  },
  'KING Devs': {
    address: '0x17c08C6445401736A31f50aFbCca7258623F0Cfb', // Replace with actual WilderWorld wallet
    description: 'Manages KING Devs operations'
  },
  'KING Deployer': {
    address: '0xB26ACB02661620C7533A20CC709afDECFe3b94DB', // Replace with actual WilderWorld wallet
    description: 'Manages KING Devs deployments'
  }
} as const

export type TacticalWalletName = keyof typeof TACTICAL_WALLETS
export type TacticalWallet = typeof TACTICAL_WALLETS[TacticalWalletName]

export function getTacticalAddresses(): string[] {
  return Object.values(TACTICAL_WALLETS).map(wallet => wallet.address)
} 