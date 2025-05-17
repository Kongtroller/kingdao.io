import Moralis from 'moralis'

const MORALIS_APP_ID = process.env.NEXT_PUBLIC_MORALIS_APP_ID
const MORALIS_SERVER_URL = process.env.NEXT_PUBLIC_MORALIS_SERVER_URL

Moralis.start({ serverUrl: MORALIS_SERVER_URL, appId: MORALIS_APP_ID })

export async function fetchTransactions(address) {
  const options = { chain: 'eth', address }
  const transactions = await Moralis.Web3API.account.getTransactions(options)
  return transactions.result
}

export async function fetchNFTs(address) {
  const options = { chain: 'eth', address }
  const nfts = await Moralis.Web3API.account.getNFTs(options)
  return nfts.result
}
