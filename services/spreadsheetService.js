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
  try {
    const [
      { data: investments, error: investmentsError },
      { data: expenses, error: expensesError },
      { data: revenue, error: revenueError }
    ] = await Promise.all([
      supabase.from('investments').select('*').order('date', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('revenue').select('*').order('date', { ascending: false })
    ])

    if (investmentsError) throw investmentsError
    if (expensesError) throw expensesError
    if (revenueError) throw revenueError

    return {
      investments: investments || [],
      expenses: expenses || [],
      revenue: revenue || []
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