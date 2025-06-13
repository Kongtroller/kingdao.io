import fs from 'fs'
import { parse } from 'csv-parse'
import { supabase } from '../utils/supabase'
import path from 'path'

async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = []
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error))
  })
}

async function migrateData() {
  try {
    console.log('Starting migration...')

    // Read CSV files
    const [investments, expenses, revenue] = await Promise.all([
      parseCsvFile(path.join(process.cwd(), 'data', 'investments.csv')),
      parseCsvFile(path.join(process.cwd(), 'data', 'expenses.csv')),
      parseCsvFile(path.join(process.cwd(), 'data', 'revenue.csv'))
    ])

    // Transform and clean the data
    const cleanInvestments = investments.map(row => ({
      date: row.Date,
      asset: row.Asset,
      amount: parseFloat(row.Amount),
      value: parseFloat(row.Value),
      notes: row.Notes
    }))

    const cleanExpenses = expenses.map(row => ({
      date: row.Date,
      category: row.Category,
      amount: parseFloat(row.Amount),
      description: row.Description
    }))

    const cleanRevenue = revenue.map(row => ({
      date: row.Date,
      source: row.Source,
      amount: parseFloat(row.Amount),
      notes: row.Notes
    }))

    // Insert data into Supabase
    if (cleanInvestments.length > 0) {
      console.log('Migrating investments...')
      const { error: investmentsError } = await supabase
        .from('investments')
        .insert(cleanInvestments)
      if (investmentsError) {
        console.error('Error inserting investments:', investmentsError)
        throw investmentsError
      }
      console.log(`Inserted ${cleanInvestments.length} investments`)
    }

    if (cleanExpenses.length > 0) {
      console.log('Migrating expenses...')
      const { error: expensesError } = await supabase
        .from('expenses')
        .insert(cleanExpenses)
      if (expensesError) {
        console.error('Error inserting expenses:', expensesError)
        throw expensesError
      }
      console.log(`Inserted ${cleanExpenses.length} expenses`)
    }

    if (cleanRevenue.length > 0) {
      console.log('Migrating revenue...')
      const { error: revenueError } = await supabase
        .from('revenue')
        .insert(cleanRevenue)
      if (revenueError) {
        console.error('Error inserting revenue:', revenueError)
        throw revenueError
      }
      console.log(`Inserted ${cleanRevenue.length} revenue items`)
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

migrateData() 