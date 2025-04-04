import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, X, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FieldMapper.css';

// Configure Axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const ConnectionLines = ({ mappings }) => {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const calculateLines = () => {
      const newLines = mappings.map(mapping => {
        const existingField = document.querySelector(`[data-field="${mapping.existing}"]`);
        const newField = document.querySelector(`[data-field="${mapping.new}"]`);

        if (existingField && newField) {
          const existingRect = existingField.getBoundingClientRect();
          const newRect = newField.getBoundingClientRect();
          const containerRect = document.querySelector('.fields-section').getBoundingClientRect();

          return {
            x1: existingRect.right - containerRect.left,
            y1: existingRect.top - containerRect.top + existingRect.height / 2,
            x2: newRect.left - containerRect.left,
            y2: newRect.top - containerRect.top + newRect.height / 2
          };
        }
        return null;
      }).filter(line => line !== null);

      setLines(newLines);
    };

    calculateLines();
    window.addEventListener('resize', calculateLines);
    return () => window.removeEventListener('resize', calculateLines);
  }, [mappings]);

  return (
      <svg
          className="connection-lines"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
      >
        {lines.map((line, index) => (
            <g key={index}>
              <path
                  d={`M ${line.x1} ${line.y1} C ${line.x1 + 100} ${line.y1}, ${line.x2 - 100} ${line.y2}, ${line.x2} ${line.y2}`}
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="2"
                  fill="none"
              />
            </g>
        ))}
      </svg>
  );
};

const FieldMapper = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [existingFieldsData, setExistingFieldsData] = useState([]);
  const [newData, setNewData] = useState(null);
  const [existingTables, setExistingTables] = useState(['default']);
  const [newTables, setNewTables] = useState([]);
  const [selectedExistingTable, setSelectedExistingTable] = useState('default');
  const [selectedNewTable, setSelectedNewTable] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [newDataFile, setNewDataFile] = useState(null);
  const [existingFields, setExistingFields] = useState([]);

  // Fetch existing fields from MongoDB when component mounts
  useEffect(() => {
    fetchExistingFields();
  }, []);

  const fetchExistingFields = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sales-schema');
      if (response.data && response.data.schema) {
        setExistingFields(response.data.schema);

        // Create a mock data structure for display
        const mockData = {};
        mockData.default = [
          response.data.schema.reduce((obj, field) => {
            obj[field] = null; // Placeholder values
            return obj;
          }, {})
        ];

        setExistingFieldsData(mockData);
        setExistingTables(['default']);
        setSelectedExistingTable('default');
      }
    } catch (err) {
      console.error('Error fetching existing fields:', err);
      setError('Failed to load database schema. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (type === 'new') {
          setNewDataFile(file);
          setLoading(true);

          // Use the API to preview the file
          const formData = new FormData();
          formData.append('file', file);

          const response = await api.post('/upload-preview', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          if (response.data && response.data.new_data) {
            // If it's an array, treat it as a single table named 'default'
            const jsonData = { default: response.data.new_data };
            setNewData(jsonData);
            setNewTables(['default']);
            setSelectedNewTable('default');
          } else {
            setError('No data found in the file');
          }
        }

        // Clear any existing mappings when new file is uploaded
        setMappings([]);
        setSelectedField(null);
        setStatusMessage('');
        setLoading(false);
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Error processing file. Please make sure it\'s a valid format.');
        setLoading(false);
      }
    }
  };

  const handleFieldClick = (field, isExisting) => {
    // Check if the field is already mapped
    const existingMappingIndex = mappings.findIndex(m =>
        (isExisting && m.existing === field) || (!isExisting && m.new === field)
    );

    // If field is already mapped and clicked again, remove the mapping
    if (existingMappingIndex !== -1) {
      removeMapping(existingMappingIndex);
      setSelectedField(null);
      return;
    }

    // Normal mapping flow
    if (!selectedField) {
      setSelectedField({ field, isExisting });
    } else {
      if (selectedField.isExisting !== isExisting) {
        const newMapping = selectedField.isExisting ?
            { existing: selectedField.field, new: field } :
            { existing: field, new: selectedField.field };

        const mappingExists = mappings.some(m =>
            m.existing === newMapping.existing && m.new === newMapping.new
        );

        if (!mappingExists) {
          setMappings(prev => [...prev, newMapping]);
        }
      }
      setSelectedField(null);
    }
  };

  const removeMapping = (index) => {
    setMappings(prev => prev.filter((_, i) => i !== index));
  };

  const exportMappings = () => {
    const exportData = {
      mappings,
      metadata: {
        exportDate: new Date().toISOString(),
        existingDataFields: [selectedExistingTable],
        newDataFields: [selectedNewTable]
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'field-mappings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const processMapping = async () => {
    if (!newDataFile || mappings.length === 0) {
      setError('Please upload a file and create at least one mapping');
      return;
    }

    setLoading(true);
    setError(null);
    setStatusMessage('Processing merge...');

    try {
      // Upload the file first to get the data
      const formData = new FormData();
      formData.append('file', newDataFile);

      const uploadResponse = await api.post('/upload-preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (uploadResponse.data && uploadResponse.data.new_data) {
        // Now send the data and mappings to the process-merge-mappings endpoint
        const mergePayload = {
          new_data: uploadResponse.data.new_data,
          field_mappings: {
            mappings: mappings
          },
          matching_fields: existingFields.filter(field =>
              mappings.some(mapping =>
                  mapping.existing === field && mapping.new
              )
          )
        };

        const mergeResponse = await api.post('/process-merge-mappings', mergePayload);

        setStatusMessage(`Success: ${mergeResponse.data.message}`);

        // Navigate back to dashboard after successful merge
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      console.error('Error processing merge:', err);
      setError(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFieldMapped = (field, isExisting) => {
    return mappings.some(m =>
        (isExisting && m.existing === field) || (!isExisting && m.new === field)
    );
  };

  const renderFields = (data, isExisting) => {
    if (!data) return null;

    const selectedTable = isExisting ? selectedExistingTable : selectedNewTable;
    const tables = isExisting ? existingTables : newTables;
    const setSelectedTable = isExisting ? setSelectedExistingTable : setSelectedNewTable;

    // Get the data for the selected table
    const tableData = data[selectedTable]?.[0] || {};

    if (!tableData || Object.keys(tableData).length === 0) {
      return (
          <div className="fields-container">
            <div className="fields-header">
              <h3>{isExisting ? 'Existing Data Fields' : 'New Data Fields'}</h3>
              {tables.length > 0 && (
                  <select
                      value={selectedTable || ''}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className="table-select"
                  >
                    {tables.map(table => (
                        <option key={table} value={table}>
                          {table}
                        </option>
                    ))}
                  </select>
              )}
            </div>
            <div className="fields-list empty-list">
              <p>No fields available</p>
            </div>
          </div>
      );
    }

    return (
        <div className="fields-container">
          <div className="fields-header">
            <h3>{isExisting ? 'Existing Data Fields' : 'New Data Fields'}</h3>
            {tables.length > 0 && (
                <select
                    value={selectedTable || ''}
                    onChange={(e) => {
                      setSelectedTable(e.target.value);
                      setMappings([]); // Clear mappings when table changes
                      setSelectedField(null);
                    }}
                    className="table-select"
                >
                  {tables.map(table => (
                      <option key={table} value={table}>
                        {table}
                      </option>
                  ))}
                </select>
            )}
          </div>
          <div className="fields-list">
            {Object.keys(tableData).map(field => {
              const isMapped = isFieldMapped(field, isExisting);
              const isSelected = selectedField?.field === field && selectedField?.isExisting === isExisting;

              return (
                  <div
                      key={field}
                      data-field={field}
                      onClick={() => handleFieldClick(field, isExisting)}
                      className={`field-item ${isSelected ? 'selected' : ''} ${isMapped ? 'mapped' : ''}`}
                  >
                    {field}
                  </div>
              );
            })}
          </div>
        </div>
    );
  };

  return (
      <div className="page-container">
        <div className="content-container">
          <div className="header">
            <h1>Field Mapper</h1>
            <p>Map fields between your database and new data</p>
          </div>

          {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
          )}

          {statusMessage && (
              <div className="status-message">
                <span>{statusMessage}</span>
              </div>
          )}

          <div className="upload-section">
            <div className="upload-container">
              <label className="upload-label">
                Existing Data Fields (from database):
              </label>
              <div className="database-fields-info">
                <span>These fields are loaded from your MongoDB database</span>
              </div>
            </div>

            <div className="upload-container">
              <label className="upload-label">
                Upload New Data:
              </label>
              <div className="file-input-wrapper">
                <input
                    type="file"
                    accept=".json,.csv,.xlsx,.xls,.xml"
                    onChange={(e) => handleFileUpload(e, 'new')}
                    id="file-new"
                />
                <label
                    htmlFor="file-new"
                    className="file-input-button"
                >
                  <Upload size={20} />
                  <span>Choose File</span>
                </label>
                {newDataFile && (
                    <span className="file-name">{newDataFile.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="fields-section" style={{ position: 'relative' }}>
            {renderFields(existingFieldsData, true)}
            {renderFields(newData, false)}
            <ConnectionLines mappings={mappings} />
          </div>

          <div className="mappings-section">
            <div className="mappings-header">
              <h3>Field Mappings</h3>
              <div className="mapping-actions">
                {/*<button*/}
                {/*    onClick={exportMappings}*/}
                {/*    className="export-button"*/}
                {/*    disabled={mappings.length === 0}*/}
                {/*>*/}
                {/*  <Save size={18} />*/}
                {/*  <span>Export Mappings</span>*/}
                {/*</button>*/}
                <button
                    onClick={processMapping}
                    className="process-button"
                    disabled={mappings.length === 0 || !newDataFile || loading}
                >
                  {loading ? (
                      <span>Processing...</span>
                  ) : (
                      <>
                        <ArrowRight size={18}/>
                        <span>Process</span>
                      </>
                  )}
                </button>
              </div>
            </div>

            {mappings.length > 0 ? (
                <div className="mappings-list">
                  {mappings.map((mapping, index) => (
                      <div key={index} className="mapping-item">
                        <span>{mapping.existing}</span>
                        <ArrowRight size={20} />
                        <span>{mapping.new}</span>
                        <button
                            onClick={() => removeMapping(index)}
                            className="remove-mapping"
                        >
                          <X size={16} />
                          <span>Remove</span>
                        </button>
                      </div>
                  ))}
                </div>
            ) : (
                <div className="no-mappings-message">
                  <p>No mappings created yet. Click fields from both sides to create mappings.</p>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default FieldMapper;