import { Trait } from '@/types/nft';

export interface KingNFT {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  traits: Trait[];
}

// Sample data with actual token IDs
export const MANUAL_KING: KingNFT[] = [
  {
    tokenId: "73",
    name: "KING #73",
    description: "The official NFT collection of KingDAO, granting governance rights and exclusive benefits.",
    imageUrl: "/collections/king/73.png",
    traits: [
      { trait_type: "Type", value: "Genesis" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Governance Power", value: "100" },
      { trait_type: "Benefits", value: "All Access" }
    ]
  },
  {
    tokenId: "164",
    name: "KING #164",
    description: "The official NFT collection of KingDAO, granting governance rights and exclusive benefits.",
    imageUrl: "/collections/king/164.png",
    traits: [
      { trait_type: "Type", value: "Genesis" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Governance Power", value: "75" },
      { trait_type: "Benefits", value: "Premium" }
    ]
  },
  {
    tokenId: "218",
    name: "KING #218",
    description: "The official NFT collection of KingDAO, granting governance rights and exclusive benefits.",
    imageUrl: "/collections/king/218.png",
    traits: [
      { trait_type: "Type", value: "Genesis" },
      { trait_type: "Rarity", value: "Rare" },
      { trait_type: "Governance Power", value: "50" },
      { trait_type: "Benefits", value: "Enhanced" }
    ]
  },
  {
    tokenId: "267",
    name: "KING #267",
    description: "The official NFT collection of KingDAO, granting governance rights and exclusive benefits.",
    imageUrl: "/collections/king/267.png",
    traits: [
      { trait_type: "Type", value: "Genesis" },
      { trait_type: "Rarity", value: "Epic" },
      { trait_type: "Governance Power", value: "75" },
      { trait_type: "Benefits", value: "Premium" }
    ]
  },
  {
    tokenId: "771",
    name: "KING #771",
    description: "The official NFT collection of KingDAO, granting governance rights and exclusive benefits.",
    imageUrl: "/collections/king/771.png",
    traits: [
      { trait_type: "Type", value: "Genesis" },
      { trait_type: "Rarity", value: "Legendary" },
      { trait_type: "Governance Power", value: "100" },
      { trait_type: "Benefits", value: "All Access" }
    ]
  }
];

export const KING_ADDRESS = '0x6E3a2e08A88186f41ECD90E0683d9cA0983a4328'; 