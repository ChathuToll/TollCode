import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import EmployeeManagement from './components/EmployeeManagement';
import ShiftBoard from './components/ShiftBoard';
import WeeklySummary from './components/WeeklySummary';
import DailyCounts from './components/DailyCounts';
import WeeklyDashboard from './components/WeeklyDashboard';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007a68',
    },
    secondary: {
      main: '#94BEB8',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<ShiftBoard />} />
            <Route path="/employees" element={<EmployeeManagement />} />
            <Route path="/weekly-summary" element={<WeeklySummary />} />
            <Route path="/daily-counts" element={<DailyCounts />} />
            <Route path="/weekly-dashboard" element={<WeeklyDashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
