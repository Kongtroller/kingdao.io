import { Line } from 'react-chartjs-2'
import { formatCurrency } from '../utils/format'

export default function TreasuryChart({ treasuryData }) {
  const chartData = {
    labels: treasuryData.revenue.map(r => r.date).slice(-12),
    datasets: [
      {
        label: 'Revenue',
        data: treasuryData.revenue.map(r => r.amount).slice(-12),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false
      },
      {
        label: 'Expenses',
        data: treasuryData.expenses.map(e => e.amount).slice(-12),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        fill: false
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value)
          }
        }
      }
    }
  }

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={options} />
    </div>
  )
} 