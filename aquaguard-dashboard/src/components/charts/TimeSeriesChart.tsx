import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface TimeSeriesChartProps {
  data: Array<{
    timestamp: string;
    rms: number;
    peak: number;
    frequency: number;
    status: string;
  }>;
  metric: 'rms' | 'peak' | 'frequency';
}

export default function TimeSeriesChart({ data, metric }: TimeSeriesChartProps) {
  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'rms': return 'RMS';
      case 'peak': return 'Pic (V)';
      case 'frequency': return 'Fréquence (Hz)';
      default: return metric;
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'rms': return 'rgb(59, 130, 246)';
      case 'peak': return 'rgb(34, 197, 94)';
      case 'frequency': return 'rgb(168, 85, 247)';
      default: return 'rgb(156, 163, 175)';
    }
  };

  const chartData = {
    labels: data.map(d => new Date(d.timestamp)),
    datasets: [
      {
        label: getMetricLabel(metric),
        data: data.map(d => d[metric]),
        borderColor: getMetricColor(metric),
        backgroundColor: getMetricColor(metric) + '20',
        borderWidth: 2,
        pointRadius: data.length > 50 ? 0 : 2,
        pointHoverRadius: 4,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.8)',
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}