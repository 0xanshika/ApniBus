import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './leafletFix';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LoginSelection from './pages/LoginSelection';
import AdminDashboard from './pages/AdminDashboard';
import Booking from './pages/Booking';
import ReportIssue from './pages/ReportIssue';

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginSelection />} />
            <Route path="/signup" element={<LoginSelection />} />
            <Route path="/login-form" element={<Login />} />
            <Route path="/signup-form" element={<Signup />} />
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} /> 
            <Route path="/booking" element={<Booking />}/>
            <Route path="/report" element={<ReportIssue />} />
        </Routes>
    </Router>
  );
}

export default App; // <--- THIS LINE IS LIKELY MISSING