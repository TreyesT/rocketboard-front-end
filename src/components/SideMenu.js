// src/components/SideMenu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SideMenu.css';

const SideMenu = ({
                      isOpen,
                      onClose,
                      file,
                      handleFileChange,
                      handleUpload,
                      mergeStatus,
                      backupOptions,
                      backupName,
                      setBackupName,
                      handleRestoreBackup,
                      restoreStatus,
                      showCharts,
                      handleCheckboxChange,
                  }) => {
    const navigate = useNavigate();

    return (
        <div className={`side-menu ${isOpen ? 'open' : ''}`}>
            <button className="close-button" onClick={onClose}>
                &times;
            </button>

            {/* Manual Merge Navigation */}
            <div className="menu-section">
                <button className="button" onClick={() => navigate('/app-sam')}>
                    Merge New Data Manually
                </button>
            </div>

            {/* File Upload Section */}
            <div className="upload-section">
                <h2>Upload and Merge Data</h2>
                <input type="file" onChange={handleFileChange} />
                <button className="button" onClick={handleUpload}>
                    Upload and Merge
                </button>
                {mergeStatus && <p className="status-message">{mergeStatus}</p>}
            </div>

            {/* Backup and Restore Section */}
            <div className="backup-section">
                <h2>Restore Previous Backup</h2>
                <select
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                >
                    <option value="">Select a backup</option>
                    {backupOptions.map((backup) => (
                        <option key={backup} value={backup}>
                            {backup}
                        </option>
                    ))}
                </select>
                <button className="button" onClick={handleRestoreBackup}>
                    Restore Backup
                </button>
                {restoreStatus && <p className="status-message">{restoreStatus}</p>}
            </div>

            {/* Chart Visibility Controls */}
            <div className="checkbox-section">
                <h2>Toggle Graph Visibility</h2>
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
        </div>
    );
};

export default SideMenu;