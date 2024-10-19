// src/components/Dashboard.js
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
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import SideMenu from './SideMenu'; // Import the SideMenu component
import './Dashboard.css';

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
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // State to manage the order of the charts
  const [chartsOrder, setChartsOrder] = useState([
    'lineChart',
    'barChart',
    'pieChart',
    'doughnutChart',
  ]);

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
      setMergedData(uploadResponse.data.mergedData);
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
      setSalesData(response.data.restoredData);
      setMergedData([]);
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

  // Handle drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newOrder = Array.from(chartsOrder);
    const [movedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, movedItem);
    setChartsOrder(newOrder);
  };

  if (!salesData.length && !mergedData.length)
    return <div>Loading sales data...</div>;

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

  // Chart components mapping
  const chartComponents = {
    lineChart: {
      component: <Line data={lineChartData} />,
      title: 'Sales Over Time',
      visible: showCharts.showLineChart,
    },
    barChart: {
      component: <Bar data={barChartData} />,
      title: 'Units Sold by Product',
      visible: showCharts.showBarChart,
    },
    pieChart: {
      component: <Pie data={pieChartData} />,
      title: 'Sales by Location',
      visible: showCharts.showPieChart,
    },
    doughnutChart: {
      component: <Doughnut data={doughnutChartData} />,
      title: 'Sales by Gender',
      visible: showCharts.showDoughnutChart,
    },
  };

  // Filter charts that are visible
  const visibleCharts = chartsOrder.filter(
      (chartKey) => chartComponents[chartKey].visible
  );

  return (
      <div className="dashboard-container">
        {/* Menu Button */}
        <button className="menu-button" onClick={() => setIsSideMenuOpen(true)}>
          &#9776;
        </button>

        <h1>Sales Dashboard</h1>

        {/* Side Menu */}
        <SideMenu
            isOpen={isSideMenuOpen}
            onClose={() => setIsSideMenuOpen(false)}
            file={file}
            handleFileChange={handleFileChange}
            handleUpload={handleUpload}
            mergeStatus={mergeStatus}
            backupOptions={backupOptions}
            backupName={backupName}
            setBackupName={setBackupName}
            handleRestoreBackup={handleRestoreBackup}
            restoreStatus={restoreStatus}
            showCharts={showCharts}
            handleCheckboxChange={handleCheckboxChange}
        />

        {/* Drag and Drop Context */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="charts" direction="vertical">
            {(provided) => (
                <div
                    className="charts-grid"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                >
                  {visibleCharts.map((chartKey, index) => (
                      <Draggable key={chartKey} draggableId={chartKey} index={index}>
                        {(provided) => (
                            <div
                                className="chart-box"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                              <h2>{chartComponents[chartKey].title}</h2>
                              {chartComponents[chartKey].component}
                            </div>
                        )}
                      </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
  );
};

export default Dashboard;
