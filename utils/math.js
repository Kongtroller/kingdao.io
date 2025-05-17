import { ethers } from 'ethers'

// Convert a BigNumber to a human-readable ETH string
export function fromWei(bn, decimals = 18) {
  return ethers.utils.formatUnits(bn, decimals)
}

// Sum an array of BigNumbers
export function sumBigNumbers(bns) {
  return bns.reduce((acc, curr) => acc.add(curr), ethers.BigNumber.from(0))
}
