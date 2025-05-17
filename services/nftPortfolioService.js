import { ethers } from 'ethers'

const NFT_COLLECTIONS = {
  // Add your NFT collections here
  Rollbots: {
    address: '0x2f102e69cbce4938cf7fb27adb40fad097a13668',
    name: 'Rollbots',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  Sportsbots: {
    address: '0x1de7abda2d73a01aa8dca505bdcb773841211daf',
    name: 'Sportsbots',
    abi: ['function balanceOf(address) view returns (uint256)']
  },
  // Add more collections as needed
}

export async function getNFTPortfolioData(walletAddresses, provider) {
  try {
    const portfolioData = {}

    for (const [collectionId, collection] of Object.entries(NFT_COLLECTIONS)) {
      const contract = new ethers.Contract(collection.address, collection.abi, provider)
      const holdings = []

      // Check NFT holdings for each wallet
      for (const address of walletAddresses) {
        try {
          const balance = await contract.balanceOf(address)
          if (balance.gt(0)) {
            holdings.push({
              wallet: address,
              balance: balance.toNumber()
            })
          }
        } catch (err) {
          console.error(`Error fetching balance for ${collection.name} in wallet ${address}:`, err)
        }
      }

      if (holdings.length > 0) {
        portfolioData[collectionId] = {
          name: collection.name,
          address: collection.address,
          holdings
        }
      }
    }

    return portfolioData
  } catch (error) {
    console.error('Failed to fetch NFT portfolio data:', error)
    return {}
  }
}

// Function to get NFT metadata if needed
export async function getNFTMetadata(contractAddress, tokenId, provider) {
  const ERC721_ABI = [
    'function tokenURI(uint256) view returns (string)',
    'function ownerOf(uint256) view returns (address)'
  ]

  try {
    const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider)
    const [tokenURI, owner] = await Promise.all([
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId)
    ])

    // Fetch metadata from IPFS or HTTP
    let metadata = {}
    if (tokenURI) {
      const uri = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')
      const response = await fetch(uri)
      metadata = await response.json()
    }

    return {
      tokenId,
      owner,
      tokenURI,
      metadata
    }
  } catch (error) {
    console.error(`Failed to fetch metadata for token ${tokenId}:`, error)
    return null
  }
} 