// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import BrowseJobs from './components/BrowseJobs';
import Register from './components/Register';
import Login from './components/Login';
import ManageJobs from './components/ManageJobs';
import HomePage from './components/HomePage'; 
import Account from './components/Account';

function App() {
  // For simplicity we use a token for authentication.
  // In a real-world scenario, you'd also want to store user role information.
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [user, setUser] = useState(null);
  return (
    <Router>
      <NavigationBar token={token} user={user} setToken={setToken} />
      <Routes>
        <Route path="/" element={<HomePage />} />           
        <Route path="/jobs" element={<BrowseJobs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />
        <Route path="/browse" element={<BrowseJobs />} />
        <Route path="/manage" element={<ManageJobs />} />
        <Route path="/" element={<BrowseJobs />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
