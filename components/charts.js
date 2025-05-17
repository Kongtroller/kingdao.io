import { Line } from 'react-chartjs-2'

export default function Chart({ data, options }) {
  return <Line data={data} options={options} />
}
