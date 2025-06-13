export interface AlchemyNFTMetadata {
  tokenId: string;
  title: string;
  description: string;
  tokenUri: {
    raw: string;
    gateway: string;
  };
  media: Array<{
    raw: string;
    gateway: string;
  }>;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
  rawMetadata?: {
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  timeLastUpdated: string;
  contractMetadata: {
    name: string;
    symbol: string;
    totalSupply: string;
    tokenType: string;
  };
} 