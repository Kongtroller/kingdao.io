import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/router'

export default function TreasuryAdmin() {
  const router = useRouter()
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('investments')
  const [formData, setFormData] = useState({})
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Form fields for each type
  const fields = {
    investments: [
      { name: 'date', type: 'date', required: true },
      { name: 'asset', type: 'text', required: true },
      { name: 'amount', type: 'number', required: true },
      { name: 'value', type: 'number', required: true },
      { name: 'notes', type: 'text' }
    ],
    expenses: [
      { name: 'date', type: 'date', required: true },
      { name: 'category', type: 'text', required: true },
      { name: 'amount', type: 'number', required: true },
      { name: 'description', type: 'text' }
    ],
    revenue: [
      { name: 'date', type: 'date', required: true },
      { name: 'source', type: 'text', required: true },
      { name: 'amount', type: 'number', required: true },
      { name: 'notes', type: 'text' }
    ]
  }

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      } else {
        loadData()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    const { data, error } = await supabase
      .from(activeTab)
      .select('*')
      .order('date', { ascending: false })
    
    if (error) {
      console.error('Error loading data:', error)
    } else {
      setItems(data)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    const { error } = await supabase
      .from(activeTab)
      .insert([formData])

    if (error) {
      alert('Error saving data: ' + error.message)
    } else {
      setFormData({})
      loadData()
      alert('Data saved successfully!')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase
      .from(activeTab)
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting item: ' + error.message)
    } else {
      loadData()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Treasury Admin</h1>

      {/* Tab Navigation */}
      <div className="flex space-x-4 mb-8">
        {Object.keys(fields).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg capitalize ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Add New Item Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New {activeTab.slice(0, -1)}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields[activeTab].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {field.name}
              </label>
              <input
                type={field.type}
                required={field.required}
                value={formData[field.name] || ''}
                onChange={e => setFormData({
                  ...formData,
                  [field.name]: e.target.value
                })}
                className="w-full p-2 border rounded"
              />
            </div>
          ))}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>

      {/* Items List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 capitalize">{activeTab} List</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {fields[activeTab].map(field => (
                    <th key={field.name} className="text-left p-2 capitalize">
                      {field.name}
                    </th>
                  ))}
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t">
                    {fields[activeTab].map(field => (
                      <td key={field.name} className="p-2">
                        {item[field.name]}
                      </td>
                    ))}
                    <td className="p-2">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 