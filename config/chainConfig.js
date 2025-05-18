// config\chainConfig.js
import { Network } from 'alchemy-sdk';
import {
  polygon, mainnet,
} from 'viem/chains';

const CHAINS = {
  [mainnet.id]: {
    name: 'Ethereum',
    icon: 'ethereum',
    alchemyNetwork: Network.ETH_MAINNET,
    alchemySlug: 'eth-mainnet',
    customRpc: null,
    viem: mainnet,
    contract: '',
    blockExplorer: 'https://etherscan.io'
  },
  [polygon.id]: {
    name: 'Polygon',
    icon: 'polygon',
    alchemyNetwork: Network.MATIC_MAINNET,
    alchemySlug: 'polygon-mainnet',
    customRpc: null,
    viem: polygon,
    contract: '',
    blockExplorer: 'https://polygonscan.com',
  },
};

export const SUPPORTED_CHAIN_IDS = Object.keys(CHAINS).map(Number);
export const getChainInfo = (chainId) => CHAINS[chainId];
export const getSupportedChains = () => SUPPORTED_CHAIN_IDS.map(id => CHAINS[id]);

export default CHAINS;
