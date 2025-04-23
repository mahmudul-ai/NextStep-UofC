// Import React and required routing components
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
import JobDetail from './components/JobDetail';
import StudentVerificationQueue from './components/StudentVerificationQueue';
import EmployerVerificationQueue from './components/EmployerVerificationQueue';
import JobModerationPage from './components/JobModerationPage';

// Add new imports for our components
import ApplicationHistory from './components/ApplicationHistory';
import SavedJobs from './components/SavedJobs';

// Add new import for ApplicationDetail
import ApplicationDetail from './components/ApplicationDetail';

// Import for job creation
import CreateJobPosting from './components/CreateJobPosting';

function App() {
  // Store authentication token (read from localStorage initially)
  // Used to determine if a user is logged in
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');

  // Optionally store current user info (can be expanded later)
  const [user, setUser] = useState(null);
  
  // Initialize user from localStorage if available
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    if (token && userRole) {
      // Create a basic user object from localStorage data
      const userData = {
        user_type: userRole,
        email: localStorage.getItem('email') || '',
      };
      
      // Add role-specific data
      if (userRole === 'student') {
        userData.ucid = localStorage.getItem('ucid') || '';
      } else if (userRole === 'employer') {
        userData.company_name = localStorage.getItem('companyName') || '';
      }
      
      setUser(userData);
    }
  }, [token]);
  
  // Function to handle logout
  const handleLogout = () => {
    // Clear all auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('ucid');
    localStorage.removeItem('companyName');
    localStorage.removeItem('email');
    
    // Clear state
    setToken('');
    setUser(null);
  };

  // Protected route component
  const ProtectedRoute = ({ children, requiredRoles = [] }) => {
    const userRole = localStorage.getItem('userRole');
    
    if (!token) {
      // Not logged in
      return <Navigate to="/login" />;
    }
    
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      // Logged in but wrong role
      return <Navigate to="/" />;
    }
    
    // User is authenticated and has correct role
    return children;
  };

  return (
    <Router>
      {/* Top navigation bar, shared across all pages */}
      <NavigationBar token={token} user={user} onLogout={handleLogout} />

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
        <Route path="/student-dashboard" element={
          <ProtectedRoute requiredRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/jobs/:id/apply" element={
          <ProtectedRoute requiredRoles={['student']}>
            <JobApplicationForm />
          </ProtectedRoute>
        } />
        
        <Route path="/applications" element={
          <ProtectedRoute requiredRoles={['student']}>
            <ViewApplications />
          </ProtectedRoute>
        } />
        
        {/* Add new routes */}
        <Route path="/application-history" element={
          <ProtectedRoute requiredRoles={['student']}>
            <ApplicationHistory />
          </ProtectedRoute>
        } />
        
        <Route path="/saved-jobs" element={
          <ProtectedRoute requiredRoles={['student']}>
            <SavedJobs />
          </ProtectedRoute>
        } />
        
        {/* Add route for ApplicationDetail */}
        <Route path="/applications/:id" element={
          <ProtectedRoute requiredRoles={['student', 'employer']}>
            <ApplicationDetail />
          </ProtectedRoute>
        } />
        
        {/* Employer routes */}
        <Route path="/employer-dashboard" element={
          <ProtectedRoute requiredRoles={['employer']}>
            <EmployerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/manage-jobs" element={
          <ProtectedRoute requiredRoles={['employer']}>
            <ManageJobs />
          </ProtectedRoute>
        } />
        
        <Route path="/manage-jobs/new" element={
          <ProtectedRoute requiredRoles={['employer']}>
            <ManageJobs isNew={true} />
          </ProtectedRoute>
        } />
        
        <Route path="/manage-jobs/:id" element={
          <ProtectedRoute requiredRoles={['employer']}>
            <ManageJobs />
          </ProtectedRoute>
        } />
        
        <Route path="/create-job" element={
          <ProtectedRoute requiredRoles={['employer']}>
            <CreateJobPosting />
          </ProtectedRoute>
        } />
        
        {/* Moderator routes */}
        <Route path="/student-verifications" element={
          <ProtectedRoute requiredRoles={['moderator']}>
            <StudentVerificationQueue />
          </ProtectedRoute>
        } />
        
        <Route path="/employer-verifications" element={
          <ProtectedRoute requiredRoles={['moderator']}>
            <EmployerVerificationQueue />
          </ProtectedRoute>
        } />
        
        <Route path="/job-moderation" element={
          <ProtectedRoute requiredRoles={['moderator']}>
            <JobModerationPage />
          </ProtectedRoute>
        } />
        
        <Route path="/moderator-dashboard" element={
          <ProtectedRoute requiredRoles={['moderator']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Shared routes */}
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
