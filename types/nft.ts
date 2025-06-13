export interface Trait {
  trait_type: string;
  value: string | number;
}

export interface NFTMetadata {
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  traits: Trait[];
} 