// This endpoint is no longer needed as we're calling Dune directly with individual API keys
export default async function handler(req, res) {
  res.status(410).json({ error: 'This endpoint is deprecated. Use direct Dune API calls instead.' })
} 