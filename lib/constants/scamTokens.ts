// List of known scam token addresses (lowercase)
export const SCAM_TOKEN_ADDRESSES = new Set([
  // Common dust attack tokens
  '0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf', // Various Fake Tokens
  '0x2dfcf24cef66d0cf6e5b3bbd3f85947322cd5804', // Fake USDT
  '0x76960dccd5a1fe799f7c29be9f19ceb4627aeb2f', // Fake "Wallet Update"
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', // Fake UNI
  '0x912ce59144191c1204e64559fe8253a0e49e6548', // Fake ARB
  '0x2b591e99afe9f32eaa6214f7b7629768c40eeb39', // Fake HEX
])

// Whitelist of trusted token addresses (lowercase)
export const TRUSTED_TOKEN_ADDRESSES = new Set([
  '0x430ef9263e76dae63c84292c3409d61c598e9682', // Vulcan Forged PYR
])

// Common scam token symbols (lowercase)
export const SCAM_TOKEN_SYMBOLS = new Set([
  'airdrop',
  'claim',
  'reward',
  'update',
  'mint',
  'free',
  'bonus',
  'gift',
  'win',
  'lucky',
  'verify',
  'validate',
  'connect',
  'sync',
])

// Function to check if a token might be a scam
export function isLikelyScamToken(address: string, symbol: string): boolean {
  const lowerAddress = address.toLowerCase()
  
  // Check if address is in whitelist
  if (TRUSTED_TOKEN_ADDRESSES.has(lowerAddress)) {
    return false
  }

  // Check if address is in known scam list
  if (SCAM_TOKEN_ADDRESSES.has(lowerAddress)) {
    return true
  }

  // Check if symbol contains scam keywords
  const lowerSymbol = symbol.toLowerCase()
  if (SCAM_TOKEN_SYMBOLS.has(lowerSymbol)) {
    return true
  }

  // Check for suspicious patterns in symbol
  const containsScamWord = Array.from(SCAM_TOKEN_SYMBOLS).some(word => 
    lowerSymbol.includes(word)
  )
  if (containsScamWord) {
    return true
  }

  // Additional heuristics
  if (
    lowerSymbol.includes('v1') || 
    lowerSymbol.includes('v2') ||
    lowerSymbol.includes('old') ||
    lowerSymbol.includes('new') ||
    lowerSymbol.includes('upgrade') ||
    lowerSymbol.includes('migration')
  ) {
    return true
  }

  return false
} 