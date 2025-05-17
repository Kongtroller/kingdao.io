import { getAllDuneData } from '../../services/duneService'
import { cacheService } from '../../services/cacheService'

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get cached data
    const cachedData = cacheService.getData()
    const now = Date.now()
    const lastUpdate = cachedData.lastUpdate ? new Date(cachedData.lastUpdate).getTime() : 0
    
    // If cache is valid, return cached data
    if (lastUpdate && now - lastUpdate < CACHE_DURATION) {
      return res.status(200).json(cachedData)
    }

    // Fetch fresh data
    const data = await getAllDuneData()
    
    // Update cache
    cacheService.setData(data)
    
    res.status(200).json({
      lastUpdate: new Date().toISOString(),
      data
    })
  } catch (error) {
    console.error('Error fetching Dune data:', error)
    
    // If error occurs, return cached data if available
    const cachedData = cacheService.getData()
    if (cachedData.lastUpdate) {
      res.status(200).json({
        ...cachedData,
        error: 'Using cached data due to fetch error'
      })
    } else {
      res.status(500).json({ error: 'Failed to fetch data' })
    }
  }
} 