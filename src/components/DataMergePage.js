// src/components/DataMergePage.js
import React, { useState } from 'react';
import api from '../api';
import './DataMergePage.css';

const DataMergePage = () => {
    const [existingData, setExistingData] = useState([]);
    const [existingSchema, setExistingSchema] = useState([]);
    const [newData, setNewData] = useState([]);
    const [newSchema, setNewSchema] = useState([]);
    const [file, setFile] = useState(null);
    const [selectedSchema, setSelectedSchema] = useState('original'); // 'original' or 'new'
    const [mergeStatus, setMergeStatus] = useState('');

    // Fetch existing data and schema
    const fetchExistingDataAndSchema = async () => {
        try {
            const dataResponse = await api.get('/sales');
            setExistingData(dataResponse.data);

            const schemaResponse = await api.get('/sales-schema');
            setExistingSchema(schemaResponse.data.schema);
        } catch (err) {
            console.error('Error fetching existing data:', err);
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Upload file and get new data preview
    const handleUploadPreview = async () => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await api.post('/upload-preview', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setNewData(response.data.new_data);

            // Get schema of new data
            if (response.data.new_data.length > 0) {
                const schema = Object.keys(response.data.new_data[0]);
                setNewSchema(schema);
            }
        } catch (error) {
            console.error('Error uploading file for preview:', error);
        }
    };

    // Handle schema selection change
    const handleSchemaSelection = (e) => {
        setSelectedSchema(e.target.value);
    };

    // Handle data merge
    const handleMergeData = async () => {
        try {
            const response = await api.post('/merge-data', {
                new_data: newData,
                selected_schema: selectedSchema,
            });
            setMergeStatus(response.data.message);
        } catch (error) {
            console.error('Error merging data:', error);
        }
    };

    // Fetch existing data when the component mounts
    React.useEffect(() => {
        fetchExistingDataAndSchema();
    }, []);

    // Step 6: Compare Schemas and Highlight Differences
    const originalSchemaSet = new Set(existingSchema);
    const newSchemaSet = new Set(newSchema);

    const columnsOnlyInOriginal = existingSchema.filter(
        (col) => !newSchemaSet.has(col)
    );
    const columnsOnlyInNew = newSchema.filter(
        (col) => !originalSchemaSet.has(col)
    );

    return (
        <div className="data-merge-container">
            {/* Back Button */}
            <button
                className="back-button"
                onClick={() => window.history.back()}
            >
                &larr; Back
            </button>

            <h1>Data Merge</h1>

            {/* File Upload Section */}
            <div className="upload-section">
                <input type="file" onChange={handleFileChange} />
                <button className="button" onClick={handleUploadPreview}>
                    Upload and Preview
                </button>
            </div>

            {/* Schema Selection */}
            {newData.length > 0 && (
                <div className="schema-selection">
                    <label>Select Schema to Use:</label>
                    <select value={selectedSchema} onChange={handleSchemaSelection}>
                        <option value="original">Original Schema</option>
                        <option value="new">New Schema</option>
                    </select>
                </div>
            )}

            {/* Data Tables */}
            <div className="tables-container">
                {/* Existing Data Table */}
                <div className="table-wrapper">
                    <h2>Existing Data</h2>
                    <table>
                        <thead>
                        <tr>
                            {existingSchema.map((col) => (
                                <th
                                    key={col}
                                    style={{
                                        backgroundColor: columnsOnlyInOriginal.includes(col)
                                            ? 'red'
                                            : '#262C48',
                                    }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {existingData.slice(0, 10).map((row, index) => (
                            <tr key={index}>
                                {existingSchema.map((col) => (
                                    <td key={col}>
                                        {typeof row[col] === 'object' && row[col] !== null
                                            ? JSON.stringify(row[col])
                                            : row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* New Data Table */}
                <div className="table-wrapper">
                    <h2>New Data</h2>
                    <table>
                        <thead>
                        <tr>
                            {newSchema.map((col) => (
                                <th
                                    key={col}
                                    style={{
                                        backgroundColor: columnsOnlyInNew.includes(col)
                                            ? 'red'
                                            : '#262C48',
                                    }}
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {newData.slice(0, 10).map((row, index) => (
                            <tr key={index}>
                                {newSchema.map((col) => (
                                    <td key={col}>
                                        {typeof row[col] === 'object' && row[col] !== null
                                            ? JSON.stringify(row[col])
                                            : row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Merge Button */}
            {newData.length > 0 && (
                <div className="merge-button-container">
                    <button className="button" onClick={handleMergeData}>
                        Merge Data
                    </button>
                    {mergeStatus && <p>{mergeStatus}</p>}
                </div>
            )}
        </div>
    );
};

export default DataMergePage;