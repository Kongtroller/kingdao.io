import { GraphQLClient } from 'graphql-request'

const endpoint = 'https://graphql.bitquery.io'

// BitQuery requires both X-API-KEY and Authorization headers
const API_KEY = 'BQYNHUSlQUTmkkDqjLVNpqLKhQZJWRCU'  // The static API key
const TOKEN = process.env.NEXT_PUBLIC_BITQUERY_API_KEY?.trim() // Your Bearer token

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'X-API-KEY': API_KEY,
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
})

// Test the connection
export async function testBitQueryAuth() {
  const testQuery = `
    query {
      EVM {
        Blocks(limit: 1) {
          Block {
            Number
          }
        }
      }
    }
  `
  
  try {
    console.log('Testing BitQuery connection with headers:', {
      'X-API-KEY': API_KEY,
      'Authorization': `Bearer ${TOKEN}`,
    })
    const result = await graphqlClient.request(testQuery)
    console.log('BitQuery connection test:', result)
    return true
  } catch (error) {
    console.error('BitQuery connection failed:', {
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers
    })
    return false
  }
} 