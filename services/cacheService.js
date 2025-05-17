import fs from 'fs-extra'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'dune-data.json')

// Ensure cache directory exists
fs.ensureDirSync(CACHE_DIR)

// Initialize cache file if it doesn't exist
if (!fs.existsSync(CACHE_FILE)) {
  fs.writeJsonSync(CACHE_FILE, {
    lastUpdate: null,
    data: {}
  }, { spaces: 2 })
}

export const cacheService = {
  getData() {
    try {
      return fs.readJsonSync(CACHE_FILE)
    } catch (error) {
      console.error('Error reading cache:', error)
      return { lastUpdate: null, data: {} }
    }
  },

  setData(data) {
    try {
      fs.writeJsonSync(CACHE_FILE, {
        lastUpdate: new Date().toISOString(),
        data
      }, { spaces: 2 })
    } catch (error) {
      console.error('Error writing cache:', error)
    }
  }
} 