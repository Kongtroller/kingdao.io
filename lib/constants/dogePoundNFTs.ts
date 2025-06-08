import { Trait } from '@/types/nft';

export interface DogePoundNFT {
  tokenId: string;
  name: string;
  description?: string;
  imageUrl: string;
  traits: Trait[];
}

export const MANUAL_DOGEPOUND: DogePoundNFT[] = [{
  "tokenId": "8944",
  "name": "DOGGY #8944",
  "description": "The Doge Pound is 10,000 art pieces carefully chosen by Professor Elon. A unique digital collection of diverse NFTs lying on Ethereum Blockchain. Each one is thoughtfully designed, specifically picked, and impeccably shaped.",
  "imageUrl": "/collections/doge-pound/8944.png",
  "traits": [
    {
      "trait_type": "Mouth",
      "value": "Original"
    },
    {
      "trait_type": "Clothing",
      "value": "Dog Collar"
    },
    {
      "trait_type": "Background",
      "value": "Blue"
    },
    {
      "trait_type": "Fur",
      "value": "Teal"
    },
    {
      "trait_type": "Eyes",
      "value": "Grumpy"
    },
    {
      "trait_type": "Gender",
      "value": "Doge"
    }
  ]
}];