"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceChartProps {
  title?: string;
  data: number[];
  labels: string[];
  isPositive?: boolean;
}

export default function PriceChart({
  title = 'Bitcoin Price',
  data,
  labels,
  isPositive = true
}: PriceChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data: data,
        borderColor: isPositive ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)',
        backgroundColor: isPositive 
          ? 'rgba(59, 130, 246, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          display: true,
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 10,
          },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 6,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          display: true,
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 10,
          },
          callback: (value: any) => {
            return `$${value.toLocaleString()}`;
          },
        },
        beginAtZero: false,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(63, 63, 70, 0.5)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="relative h-64 w-full">
      <Line data={chartData} options={options as any} />
    </div>
  );
}
