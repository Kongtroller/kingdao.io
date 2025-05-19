import { google } from 'googleapis'
import { supabase } from '../utils/supabase'

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

const SPREADSHEET_ID = process.env.TREASURY_SPREADSHEET_ID
const RANGES = {
  investments: 'Investments!A2:E',
  expenses: 'Expenses!A2:D',
  revenue: 'Revenue!A2:D'
}

async function getSheetData(range) {
  try {
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range,
    })
    return response.data.values
  } catch (error) {
    console.error(`Failed to fetch sheet data for range ${range}:`, error)
    return null
  }
}

async function migrateData() {
  try {
    console.log('Starting migration...')

    // Fetch data from Google Sheets
    const [investmentsRows, expensesRows, revenueRows] = await Promise.all([
      getSheetData(RANGES.investments),
      getSheetData(RANGES.expenses),
      getSheetData(RANGES.revenue)
    ])

    // Transform investments data
    const investments = investmentsRows?.map(row => ({
      date: row[0],
      asset: row[1],
      amount: parseFloat(row[2]),
      value: parseFloat(row[3]),
      notes: row[4]
    })) || []

    // Transform expenses data
    const expenses = expensesRows?.map(row => ({
      date: row[0],
      category: row[1],
      amount: parseFloat(row[2]),
      description: row[3]
    })) || []

    // Transform revenue data
    const revenue = revenueRows?.map(row => ({
      date: row[0],
      source: row[1],
      amount: parseFloat(row[2]),
      notes: row[3]
    })) || []

    // Insert data into Supabase
    if (investments.length > 0) {
      console.log('Migrating investments...')
      const { error: investmentsError } = await supabase
        .from('investments')
        .insert(investments)
      if (investmentsError) throw investmentsError
    }

    if (expenses.length > 0) {
      console.log('Migrating expenses...')
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(expenses)
      if (expensesError) throw expensesError
    }

    if (revenue.length > 0) {
      console.log('Migrating revenue...')
      const { error: revenueError } = await supabase
        .from('revenue')
        .insert(revenue)
      if (revenueError) throw revenueError
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData() 