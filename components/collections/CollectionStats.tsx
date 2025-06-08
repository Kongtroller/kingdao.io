import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions
} from 'chart.js';
import { formatEther } from 'viem';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CollectionStatsProps {
  totalSupply: number;
  ownedCount: number;
  floorPrice?: number;
  priceHistory?: {
    timestamp: string;
    price: number;
  }[];
}

export default function CollectionStats({ 
  totalSupply, 
  ownedCount, 
  floorPrice, 
  priceHistory = [] 
}: CollectionStatsProps) {
  const ownershipPercentage = ((ownedCount / totalSupply) * 100).toFixed(2);
  const totalValue = floorPrice ? (floorPrice * ownedCount).toFixed(4) : undefined;

  const chartData = {
    labels: priceHistory.map(entry => {
      const date = new Date(entry.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Floor Price (ETH)',
        data: priceHistory.map(entry => entry.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: false,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          callback: function(value) {
            return `${value} ETH`;
          },
        },
      },
      x: {
        type: 'category',
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* NFTs Owned */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">NFTs Owned</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">{ownedCount}</p>
          <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">of {totalSupply}</p>
        </div>
      </div>

      {/* Ownership Percentage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Collection Ownership</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-3xl font-semibold text-gray-900 dark:text-white">{ownershipPercentage}%</p>
        </div>
      </div>

      {/* Total Value */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
        <div className="mt-2 flex items-baseline">
          {totalValue ? (
            <>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">{totalValue}</p>
              <p className="ml-2 text-sm font-medium text-gray-500 dark:text-gray-400">ETH</p>
            </>
          ) : (
            <p className="text-3xl font-semibold text-gray-500 dark:text-gray-400">-</p>
          )}
        </div>
        {floorPrice && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Floor: {floorPrice.toFixed(4)} ETH
          </p>
        )}
      </div>

      {/* Floor Price Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Floor Price History</h3>
        {priceHistory.length > 0 ? (
          <Line data={chartData} options={chartOptions} height={100} />
        ) : (
          <div className="h-[100px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            No price history available
          </div>
        )}
      </div>
    </div>
  );
} 