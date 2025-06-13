import { supabase } from '../utils/supabase'

const seedData = {
  investments: [
    {
      date: '2024-01-01',
      asset: 'ETH',
      amount: 10.5,
      value: 25000,
      notes: 'Initial investment'
    }
  ],
  expenses: [
    {
      date: '2024-01-15',
      category: 'Development',
      amount: 5000,
      description: 'Smart contract audit'
    }
  ],
  revenue: [
    {
      date: '2024-01-30',
      source: 'NFT Sales',
      amount: 15000,
      notes: 'First collection launch'
    }
  ]
}

async function seedDatabase() {
  try {
    // Insert investments
    const { error: investmentsError } = await supabase
      .from('investments')
      .insert(seedData.investments)
    if (investmentsError) throw investmentsError

    // Insert expenses
    const { error: expensesError } = await supabase
      .from('expenses')
      .insert(seedData.expenses)
    if (expensesError) throw expensesError

    // Insert revenue
    const { error: revenueError } = await supabase
      .from('revenue')
      .insert(seedData.revenue)
    if (revenueError) throw revenueError

    console.log('Successfully seeded the database!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seedDatabase() 