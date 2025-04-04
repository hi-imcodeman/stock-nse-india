import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout';
import Dashboard from './components/Dashboard';
import Indices from './components/Indices';
import Equities from './components/Equities';
import Options from './components/Options';
import EquitiesWidget from './components/EquitiesWidget';
import Holidays from './components/Holidays';

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/indices" element={<Indices />} />
          <Route path="/index/:symbol" element={<Indices />} />
          <Route path="/equities" element={<Equities />} />
          <Route path="/equity/:symbol" element={<Equities />} />
          <Route path="/equities-widget" element={<EquitiesWidget />} />
          <Route path="/options" element={<Options />} />
          <Route path="/holidays" element={<Holidays />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App; 