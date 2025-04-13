// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Register from './components/Register';
import Login from './components/Login';
import BrowseJobs from './components/BrowseJobs';
import ManageJobs from './components/ManageJobs';
import './App.css';

function App() {
  // For simplicity we use a token for authentication.
  // In a real-world scenario, you'd also want to store user role information.
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');

  return (
    <Router>
      <NavigationBar token={token} setToken={setToken} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/browse" element={<BrowseJobs />} />
        <Route path="/manage" element={<ManageJobs />} />
        <Route path="/" element={<BrowseJobs />} />
      </Routes>
    </Router>
  );
}

export default App;
