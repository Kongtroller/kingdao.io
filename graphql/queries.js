export const TRADES_QUERY = /* GraphQL */ `
  query GetRecentTrades {
    ethereum(network: ethereum) {
      dexTrades(
        options: { limit: 50, desc: "block.height" }
        time: { since: "2023-01-01T00:00:00Z" }
        baseCurrency: { notIn: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"] }
      ) {
        transaction {
          hash
        }
        block {
          height
          timestamp {
            time(format: "%Y-%m-%d %H:%M:%S")
          }
        }
        tradeAmount(in: USD)
        baseAmount
        baseCurrency {
          symbol
          address
          name
        }
        quoteAmount
        quoteCurrency {
          symbol
        }
        exchange {
          fullName
        }
      }
    }
  }
` 