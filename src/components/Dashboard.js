import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement // for pie and doughnut charts
);

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [error, setError] = useState(null);

  // State to manage checkbox visibility
  const [showCharts, setShowCharts] = useState({
    showLineChart: true,
    showBarChart: true,
    showPieChart: true,
    showDoughnutChart: true,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setShowCharts((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('/api/sales');
        setSalesData(response.data);
      } catch (err) {
        setError(err);
      }
    };

    fetchSalesData();
  }, []);

  if (error) return <div>Error: {error.message}</div>;

  const dataToUse = mergedData.length ? mergedData : salesData;

  // Sales Over Time Data
  const salesOverTimeData = dataToUse.reduce((acc, sale) => {
    const date = sale.date_of_sale;
    const salesAmount = sale.sales_amount;

    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += salesAmount;

    return acc;
  }, {});

  const lineChartData = {
    labels: Object.keys(salesOverTimeData),
    datasets: [
      {
        label: 'Sales Amount',
        data: Object.values(salesOverTimeData),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Units Sold by Product Data
  const unitsSoldData = dataToUse.reduce((acc, sale) => {
    const productName = sale.product_name;
    const unitsSold = sale.units_sold;

    if (!acc[productName]) {
      acc[productName] = 0;
    }
    acc[productName] += unitsSold;

    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(unitsSoldData),
    datasets: [
      {
        label: 'Units Sold',
        data: Object.values(unitsSoldData),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Sales by Customer Location (Pie Chart)
  const salesByLocation = dataToUse.reduce((acc, sale) => {
    const location = sale.customer.location;
    if (!acc[location]) {
      acc[location] = 0;
    }
    acc[location] += sale.sales_amount;
    return acc;
  }, {});

  const pieChartData = {
    labels: Object.keys(salesByLocation),
    datasets: [
      {
        label: 'Sales by Location',
        data: Object.values(salesByLocation),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  // Sales by Gender (Doughnut Chart)
  const salesByGender = dataToUse.reduce((acc, sale) => {
    const gender = sale.customer.gender;
    if (!acc[gender]) {
      acc[gender] = 0;
    }
    acc[gender] += sale.sales_amount;
    return acc;
  }, {});

  const doughnutChartData = {
    labels: Object.keys(salesByGender),
    datasets: [
      {
        label: 'Sales by Gender',
        data: Object.values(salesByGender),
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
      },
    ],
  };

  return (
    <div>
      <h1>Sales Dashboard</h1>
      
      {/* Checkboxes for toggling graphs */}
      <div>
        <label>
          <input
            type="checkbox"
            name="showLineChart"
            checked={showCharts.showLineChart}
            onChange={handleCheckboxChange}
          />
          Show Sales Over Time
        </label>
        <label>
          <input
            type="checkbox"
            name="showBarChart"
            checked={showCharts.showBarChart}
            onChange={handleCheckboxChange}
          />
          Show Units Sold by Product
        </label>
        <label>
          <input
            type="checkbox"
            name="showPieChart"
            checked={showCharts.showPieChart}
            onChange={handleCheckboxChange}
          />
          Show Sales by Location
        </label>
        <label>
          <input
            type="checkbox"
            name="showDoughnutChart"
            checked={showCharts.showDoughnutChart}
            onChange={handleCheckboxChange}
          />
          Show Sales by Gender
        </label>
      </div>

      {/* Conditional rendering of charts based on checkbox state */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {showCharts.showLineChart && (
          <div style={{ width: '45%' }}>
            <h2>Sales Over Time</h2>
            <Line data={lineChartData} />
          </div>
        )}
        {showCharts.showBarChart && (
          <div style={{ width: '45%' }}>
            <h2>Units Sold by Product</h2>
            <Bar data={barChartData} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        {showCharts.showPieChart && (
          <div style={{ width: '45%' }}>
            <h2>Sales by Location</h2>
            <Pie data={pieChartData} />
          </div>
        )}
        {showCharts.showDoughnutChart && (
          <div style={{ width: '45%' }}>
            <h2>Sales by Gender</h2>
            <Doughnut data={doughnutChartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;