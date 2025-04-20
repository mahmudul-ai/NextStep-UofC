// Import React and required routing components
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import custom components
import NavigationBar from './components/NavigationBar';
import BrowseJobs from './components/BrowseJobs';
import Register from './components/Register';
import Login from './components/Login';
import ManageJobs from './components/ManageJobs';
import HomePage from './components/HomePage'; 
import Account from './components/Account';
import JobApplicationForm from './components/JobApplicationForm';
import ViewApplications from './components/ViewApplications';
function App() {
  // Store authentication token (read from localStorage initially)
  // Used to determine if a user is logged in
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');

  // Optionally store current user info (can be expanded later)
  const [user, setUser] = useState(null);

  return (
    <Router>
      {/* Top navigation bar, shared across all pages */}
      <NavigationBar token={token} user={user} setToken={setToken} />

      {/* Define all application routes */}
      <Routes>
        <Route path="/applications" element={<ViewApplications />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<BrowseJobs />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />
        <Route path="/browse" element={<BrowseJobs />} />
        <Route path="/manage" element={<ManageJobs />} />
        <Route path="/account" element={<Account />} />
        <Route path="/jobs/:id/apply" element={<JobApplicationForm />} />
      </Routes>
    </Router>
  );
}

export default App;
