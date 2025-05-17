import { graphqlClient } from './graphqlClient'

const TEST_QUERY = `
  query {
    EVM(dataset: realtime, network: eth) {
      Blocks(limit: 1) {
        Block {
          Number
        }
      }
    }
  }
`

export async function testBitQueryConnection() {
  try {
    const data = await graphqlClient.request(TEST_QUERY)
    console.log('BitQuery connection successful:', data)
    return true
  } catch (error) {
    console.error('BitQuery connection failed:', error)
    return false
  }
} 