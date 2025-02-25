import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import DataMergePage from './components/DataMergePage';
import AppSAM from './AppSAM';

function App() {
    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-merge" element={<DataMergePage />} />
            <Route path="/app-sam" element={<AppSAM />} />
        </Routes>
    );
}

export default App;
