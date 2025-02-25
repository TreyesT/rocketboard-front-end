import React, { useState, useEffect } from 'react';
import { ArrowRight, Upload, X } from 'lucide-react';
import './FieldMapper.css';

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
  const [existingData, setExistingData] = useState(null);
  const [newData, setNewData] = useState(null);
  const [existingTables, setExistingTables] = useState([]);
  const [newTables, setNewTables] = useState([]);
  const [selectedExistingTable, setSelectedExistingTable] = useState(null);
  const [selectedNewTable, setSelectedNewTable] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [mappings, setMappings] = useState([]);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        
        // Handle both array and object formats
        if (Array.isArray(json)) {
          // If it's an array, treat it as a single table named 'default'
          if (type === 'existing') {
            setExistingData({ default: json });
            setExistingTables(['default']);
            setSelectedExistingTable('default');
          } else {
            setNewData({ default: json });
            setNewTables(['default']);
            setSelectedNewTable('default');
          }
        } else {
          // If it's an object, each key is a table name
          const tables = Object.keys(json);
          if (type === 'existing') {
            setExistingData(json);
            setExistingTables(tables);
            setSelectedExistingTable(tables[0]);
          } else {
            setNewData(json);
            setNewTables(tables);
            setSelectedNewTable(tables[0]);
          }
        }
        
        // Clear any existing mappings when new file is uploaded
        setMappings([]);
        setSelectedField(null);
      } catch (error) {
        console.error('Error reading JSON file:', error);
        alert('Error reading JSON file. Please make sure it\'s valid JSON.');
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
        existingDataFields: existingData ? Object.keys(existingData) : [],
        newDataFields: newData ? Object.keys(newData) : []
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
    const tableData = data[selectedTable]?.[0] || null;
    
    if (!tableData) return null;

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
          <h1>JSON Field Mapper</h1>
          <p>Map fields between your existing and new JSON structures</p>
        </div>
        
        <div className="upload-section">
          {['existing', 'new'].map((type) => (
            <div key={type} className="upload-container">
              <label className="upload-label">
                Upload {type === 'existing' ? 'Existing' : 'New'} Data JSON:
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileUpload(e, type)}
                  id={`file-${type}`}
                />
                <label
                  htmlFor={`file-${type}`}
                  className="file-input-button"
                >
                  <Upload size={20} />
                  <span>Choose File</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        {(existingData || newData) && (
          <div className="fields-section" style={{ position: 'relative' }}>
            {renderFields(existingData, true)}
            {renderFields(newData, false)}
            <ConnectionLines mappings={mappings} />
          </div>
        )}

        {mappings.length > 0 && (
          <div className="mappings-section">
            <div className="mappings-header">
              <h3>Field Mappings</h3>
              <button
                onClick={exportMappings}
                className="export-button"
              >
                Export Mappings
              </button>
            </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldMapper;