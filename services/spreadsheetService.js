import { google } from 'googleapis'

// Initialize Google Sheets API
const sheets = google.sheets('v4')

// Your Google Sheets credentials
const CREDENTIALS = {
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

// Initialize auth
const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  ['https://www.googleapis.com/auth/spreadsheets.readonly']
)

export async function getSpreadsheetData(spreadsheetId, range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range,
    })

    return response.data.values
  } catch (error) {
    console.error('Failed to fetch spreadsheet data:', error)
    return null
  }
}

export async function getTreasuryData() {
  const SPREADSHEET_ID = process.env.TREASURY_SPREADSHEET_ID
  const RANGES = {
    investments: 'Investments!A2:E',
    expenses: 'Expenses!A2:D',
    revenue: 'Revenue!A2:D'
  }

  try {
    const [investments, expenses, revenue] = await Promise.all([
      getSpreadsheetData(SPREADSHEET_ID, RANGES.investments),
      getSpreadsheetData(SPREADSHEET_ID, RANGES.expenses),
      getSpreadsheetData(SPREADSHEET_ID, RANGES.revenue)
    ])

    return {
      investments: investments?.map(row => ({
        date: row[0],
        asset: row[1],
        amount: parseFloat(row[2]),
        value: parseFloat(row[3]),
        notes: row[4]
      })) || [],
      
      expenses: expenses?.map(row => ({
        date: row[0],
        category: row[1],
        amount: parseFloat(row[2]),
        description: row[3]
      })) || [],
      
      revenue: revenue?.map(row => ({
        date: row[0],
        source: row[1],
        amount: parseFloat(row[2]),
        notes: row[3]
      })) || []
    }
  } catch (error) {
    console.error('Failed to fetch treasury data:', error)
    return {
      investments: [],
      expenses: [],
      revenue: []
    }
  }
} 