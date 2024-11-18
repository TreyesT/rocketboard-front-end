import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DataMergePage from './components/DataMergePage';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-merge" element={<DataMergePage />} />
        </Routes>
    );
}

export default App;
