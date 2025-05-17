import { ethers } from 'ethers'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL

export function getProvider() {
  return new ethers.providers.JsonRpcProvider(RPC_URL)
}

export function getContract(address, abi, signerOrProvider) {
  return new ethers.Contract(address, abi, signerOrProvider)
}
