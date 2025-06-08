const { Alchemy, Network } = require('alchemy-sdk');

const settings = {
  apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

const CONTRACT_ADDRESS = '0xc2e9678A71e50E5AEd036e00e9c5caeb1aC5987D';
const TOKEN_ID = '37263806078148289478045292319502245359893571831903681984357324168914675299015';

async function checkMetadata() {
  try {
    const nft = await alchemy.nft.getNftMetadata(
      CONTRACT_ADDRESS,
      TOKEN_ID
    );
    console.log('Raw metadata:', JSON.stringify(nft.raw, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMetadata(); 