import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartRenderer = ({ chartData, chartType, title, width = 400, height = 300 }) => {
  // Default options for all chart types
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title || 'Chart Title',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
  };

  // Specific options for different chart types
  const barOptions = {
    ...defaultOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const lineOptions = {
    ...defaultOptions,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    elements: {
      line: {
        tension: 0.4, // Curved lines
      },
    },
  };

  const pieOptions = {
    ...defaultOptions,
    scales: undefined, // Pie charts don't need scales
  };

  // Generate colors for datasets
  const generateColors = (count) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
      '#4BC0C0', '#FF6384'
    ];
    return colors.slice(0, count);
  };

  // Process chart data
  const processedData = {
    labels: chartData.labels || [],
    datasets: chartData.datasets?.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || generateColors(chartData.labels?.length || 1),
      borderColor: dataset.borderColor || generateColors(chartData.labels?.length || 1),
      borderWidth: dataset.borderWidth || (chartType === 'pie' ? 0 : 2),
    })) || []
  };

  const renderChart = () => {
    switch (chartType.toLowerCase()) {
      case 'bar':
        return <Bar data={processedData} options={barOptions} />;
      case 'line':
        return <Line data={processedData} options={lineOptions} />;
      case 'pie':
        return <Pie data={processedData} options={pieOptions} />;
      default:
        return <Bar data={processedData} options={barOptions} />;
    }
  };

  return (
    <div style={{ width, height }}>
      {renderChart()}
    </div>
  );
};

// Sample chart data generator
export const generateSampleChartData = (type, dataArray) => {
  if (!dataArray || dataArray.length === 0) {
    // Default sample data
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sample Data',
        data: [12, 19, 3, 5, 2, 3],
      }]
    };
  }

  // Process real data from Excel
  const labels = dataArray.map(item => item.label || item.name || item.category);
  const values = dataArray.map(item => item.value || item.amount || item.count);

  return {
    labels,
    datasets: [{
      label: 'Data',
      data: values,
    }]
  };
};

export default ChartRenderer;