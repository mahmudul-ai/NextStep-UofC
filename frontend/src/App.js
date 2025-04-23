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
import Forum from './components/Forum';

// Import new components
import StudentDashboard from './components/StudentDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import ModeratorDashboard from './components/ModeratorDashboard';
import JobDetail from './components/JobDetail';
import StudentVerificationQueue from './components/StudentVerificationQueue';
import EmployerVerificationQueue from './components/EmployerVerificationQueue';
import JobModerationPage from './components/JobModerationPage';

// Add new imports for our components
import ApplicationHistory from './components/ApplicationHistory';
import SavedJobs from './components/SavedJobs';

// Add new import for ApplicationDetail
import ApplicationDetail from './components/ApplicationDetail';

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
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowseJobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route path="/forum" element={<Forum />} />
        
        {/* Student routes */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/jobs/:id/apply" element={<JobApplicationForm />} />
        <Route path="/applications" element={<ViewApplications />} />
        
        {/* Add new routes */}
        <Route path="/application-history" element={<ApplicationHistory />} />
        <Route path="/saved-jobs" element={<SavedJobs />} />
        
        {/* Add route for ApplicationDetail */}
        <Route path="/applications/:id" element={<ApplicationDetail />} />
        
        {/* Employer routes */}
        <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        <Route path="/manage-jobs" element={<ManageJobs />} />
        <Route path="/manage-jobs/new" element={<ManageJobs isNew={true} />} />
        <Route path="/manage-jobs/:id" element={<ManageJobs />} />
        
        {/* Moderator routes */}
        <Route path="/moderator-dashboard" element={<ModeratorDashboard />} />
        <Route path="/student-verifications" element={<StudentVerificationQueue />} />
        <Route path="/employer-verifications" element={<EmployerVerificationQueue />} />
        <Route path="/job-moderation" element={<JobModerationPage />} />
        
        {/* Shared routes */}
        <Route path="/account" element={<Account />} />
      </Routes>
    </Router>
  );
}

export default App;
