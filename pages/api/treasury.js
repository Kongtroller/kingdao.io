import { getTreasuryData } from '../../services/spreadsheetService'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const data = await getTreasuryData()
    res.status(200).json(data)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ message: 'Failed to fetch treasury data' })
  }
} 