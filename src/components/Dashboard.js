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
  ArcElement
);

const Dashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [file, setFile] = useState(null);
  const [mergeStatus, setMergeStatus] = useState(null);
  const [backupOptions, setBackupOptions] = useState([]);
  const [backupName, setBackupName] = useState('');
  const [restoreStatus, setRestoreStatus] = useState('');
  const [showCharts, setShowCharts] = useState({
    showLineChart: true,
    showBarChart: true,
    showPieChart: true,
    showDoughnutChart: true,
  });

  // Fetch sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await axios.get('/api/sales');
        setSalesData(response.data);
      } catch (err) {
        console.error('Error fetching sales data:', err);
      }
    };
    fetchSalesData();
  }, []);

  // Fetch available backups
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        const response = await axios.get('/api/list-backups');
        setBackupOptions(response.data.backups);
      } catch (err) {
        console.error('Error fetching backups:', err);
      }
    };
    fetchBackups();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle upload and merge
  const handleUpload = async () => {
    if (!file) {
      setMergeStatus('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMergeStatus(`Success: ${uploadResponse.data.message}`);
    } catch (error) {
      setMergeStatus('Error: ' + error.message);
    }
  };

  // Restore backup functionality
  const handleRestoreBackup = async () => {
    if (!backupName) {
      setRestoreStatus('Please select a backup to restore.');
      return;
    }
    try {
      const response = await axios.post('/api/restore-backup', {
        backup_name: backupName,
      });
      setRestoreStatus(response.data.message);
    } catch (error) {
      setRestoreStatus('Error restoring backup: ' + error.message);
    }
  };

  // Handle chart visibility
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setShowCharts((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  if (!salesData.length && !mergedData.length) return <div>Loading sales data...</div>;

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

      {/* File upload UI */}
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload and Merge Data</button>
        {mergeStatus && <p>{mergeStatus}</p>}
      </div>

      {/* Backup and Restore functionality */}
      <div>
        <h2>Restore Previous Backup</h2>
        <select value={backupName} onChange={(e) => setBackupName(e.target.value)}>
          <option value="">Select a backup</option>
          {backupOptions.map((backup) => (
            <option key={backup} value={backup}>
              {backup}
            </option>
          ))}
        </select>
        <button onClick={handleRestoreBackup}>Restore Backup</button>
        {restoreStatus && <p>{restoreStatus}</p>}
      </div>

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