import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import BrowseJobs from './components/BrowseJobs';
import Register from './components/Register';
import Login from './components/Login';
import ManageJobs from './components/ManageJobs';
import HomePage from './components/HomePage'; 

function App() {
  return (
    <Router>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />           
        <Route path="/jobs" element={<BrowseJobs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />
      </Routes>
    </Router>
  );
}

export default App;
