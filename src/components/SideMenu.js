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

            {/* Merge New Data Manually Button */}
            <div className="menu-section">
                <button className="button" onClick={() => navigate('/data-merge')}>
                    Merge New Data Manually
                </button>
            </div>

            {/* File upload UI */}
            <div className="upload-section">
                <input type="file" onChange={handleFileChange} />
                <button className="button" onClick={handleUpload}>
                    Upload and Merge Data
                </button>
                {mergeStatus && <p>{mergeStatus}</p>}
            </div>

            {/* Backup and Restore functionality */}
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
                {restoreStatus && <p>{restoreStatus}</p>}
            </div>

            {/* Checkboxes for toggling graphs */}
            <div className="checkbox-section">
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