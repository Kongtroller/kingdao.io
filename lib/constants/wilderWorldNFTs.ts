import { Trait } from '@/types/nft';

export interface WilderWorldNFT {
  tokenId: string;
  name: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  traits: Trait[];
}

export const MANUAL_WILDER_WORLD: WilderWorldNFT[] = [
  {
    "tokenId": "36073522002736318236441335305922097439592256555061637376927927329956085869960",
    "name": "Wova WW 1966",
    "description": "Whevrolet",
    "mediaUrl": "/collections/wilder-world/36073522002736318236441335305922097439592256555061637376927927329956085869960.png",
    "mediaType": "image",
    "traits": [
      {
        "value": "Type 1",
        "trait_type": "Bull Bar"
      },
      {
        "value": "Stock",
        "trait_type": "Rear Bar"
      },
      {
        "value": "Type 1",
        "trait_type": "Spoiler"
      },
      {
        "value": "Rorschach",
        "trait_type": "Pattern"
      },
      {
        "value": "Orange",
        "trait_type": "Wilder Logo Color"
      },
      {
        "value": "Orange",
        "trait_type": "Tire and Rim Color"
      },
      {
        "value": "Stock",
        "trait_type": "Rim"
      },
      {
        "value": "Warm White",
        "trait_type": "Headlight Color"
      },
      {
        "value": "Purple",
        "trait_type": "Number Plate Color"
      },
      {
        "value": "Type 1",
        "trait_type": "Bonnet"
      },
      {
        "value": "Intergalactic",
        "trait_type": "Color"
      },
      {
        "value": "Purple Studio",
        "trait_type": "Environment"
      },
      {
        "value": "Whevrolet Wova WW 1966",
        "trait_type": "Car Name"
      },
      {
        "value": "0163 0046",
        "trait_type": "Number Plate"
      }
    ]
  },
  {
    "tokenId": "113652907629653379513608309898474441837064767872071027020241819776297838090715",
    "name": "Wpeed8 7 Weam 2003",
    "description": "Wentley",
    "mediaUrl": "/collections/wilder-world/113652907629653379513608309898474441837064767872071027020241819776297838090715.png",
    "mediaType": "image",
    "traits": [
      {
        "value": "Type 1",
        "trait_type": "Rim"
      },
      {
        "value": "Stock",
        "trait_type": "Bonnet"
      },
      {
        "value": "Stock",
        "trait_type": "Rear Bar"
      },
      {
        "value": "Orange",
        "trait_type": "Wilder Logo Color"
      },
      {
        "value": "Orange",
        "trait_type": "Tire and Rim Color"
      },
      {
        "value": "Blue",
        "trait_type": "Number Plate Color"
      },
      {
        "value": "Stock",
        "trait_type": "Bull Bar"
      },
      {
        "value": "Stock",
        "trait_type": "Spoiler"
      },
      {
        "value": "Warm White",
        "trait_type": "Headlight Color"
      },
      {
        "value": "Lightbeam",
        "trait_type": "Color"
      },
      {
        "value": "Graff",
        "trait_type": "Pattern"
      },
      {
        "value": "Cyan Studio",
        "trait_type": "Environment"
      },
      {
        "value": "Wentley Wpeed8 7 Weam 2003",
        "trait_type": "Car Name"
      },
      {
        "value": "0720 0003",
        "trait_type": "Number Plate"
      }
    ]
  },
  {
    "tokenId": "37263806078148289478045292319502245359893571831903681984357324168914675299015",
    "name": "WXW-W 1992",
    "description": "Wonda",
    "mediaUrl": "/collections/wilder-world/37263806078148289478045292319502245359893571831903681984357324168914675299015.png",
    "mediaType": "image",
    "traits": [
      {
        "value": "Wonda WXW W 1992",
        "trait_type": "Car Name"
      },
      {
        "value": "Type 1",
        "trait_type": "Rim"
      },
      {
        "value": "Stock",
        "trait_type": "Bonnet"
      },
      {
        "value": "Stock",
        "trait_type": "Bull Bar"
      },
      {
        "value": "Stock",
        "trait_type": "Rear Bar"
      },
      {
        "value": "Type 1",
        "trait_type": "Spoiler"
      },
      {
        "value": "Red Studio",
        "trait_type": "Environment"
      },
      {
        "value": "Solstice",
        "trait_type": "Pattern"
      },
      {
        "value": "Orange",
        "trait_type": "Wilder Logo Color"
      },
      {
        "value": "Orange",
        "trait_type": "Tire and Rim Color"
      },
      {
        "value": "WILD Punk",
        "trait_type": "Color"
      },
      {
        "value": "Cool White",
        "trait_type": "Headlight Color"
      },
      {
        "value": "0259 0407",
        "trait_type": "Number Plate"
      },
      {
        "value": "Blue",
        "trait_type": "Number Plate Color"
      }
    ]
  }
] as const;

export const WILDER_WORLD_ADDRESS = '0xc2e9678A71e50E5AEd036e00e9c5caeb1aC5987D';