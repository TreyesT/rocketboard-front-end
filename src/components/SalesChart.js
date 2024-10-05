import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

const SalesCharts = ({ salesData }) => {
  const chartData1 = {
    labels: salesData.map(data => data.product_name),
    datasets: [
      {
        label: 'Units Sold',
        data: salesData.map(data => data.units_sold),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartData2 = {
    labels: salesData.map(data => data.product_name),
    datasets: [
      {
        label: 'Sales Amount',
        data: salesData.map(data => data.sales_amount),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <div style={{ width: '45%' }}>
        <h3>Units Sold</h3>
        <Bar data={chartData1} options={options} />
      </div>
      <div style={{ width: '45%' }}>
        <h3>Sales Amount</h3>
        <Bar data={chartData2} options={options} />
      </div>
    </div>
  );
};

export default SalesCharts;
