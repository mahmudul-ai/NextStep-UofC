import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import api from '../services/api';

function NavigationBar({ token, user, onLogout }) {
  const userRole = localStorage.getItem('userRole'); // e.g., "student" or "employer" or "moderator"
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Fetch user details for display
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const ucid = localStorage.getItem('ucid');
        const employerId = localStorage.getItem('employerId');
        
        let userData = null;
        
        if (userRole === 'student' || userRole === 'moderator') {
          if (ucid) {
            // Use the getStudentProfile method from the API service
            const response = await api.getStudentProfile(ucid);
            userData = response.data;
          }
        } else if (userRole === 'employer') {
          if (employerId) {
            // Use the getEmployer method from the API service
            const response = await api.getEmployer(employerId);
            userData = response.data;
          }
        }
        
        setUserDetails(userData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user details:", err);
        setLoading(false);
      }
    };
    
    fetchUserDetails();
  }, [token, userRole]);

  // Display name based on user data
  const getDisplayName = () => {
    if (userDetails) {
      if (userRole === 'student' || userRole === 'moderator') {
        const firstName = userDetails.FirstName || userDetails.FName || '';
        const lastName = userDetails.LastName || userDetails.LName || '';
        return `${firstName} ${lastName}`.trim() || userDetails.Email;
      } else if (userRole === 'employer') {
        return userDetails.CompanyName || userDetails.companyName || userDetails.Email;
      }
    }
    
    // Fallback to user prop if available
    if (user) {
      if (user.user_type === 'student') {
        return user.fname || user.first_name || user.FName || user.FirstName || user.email;
      } else if (user.user_type === 'employer') {
        return user.company_name || user.CompanyName || user.email;
      } else {
        return user.email;
      }
    }
    
    return 'Account';
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        {/* Brand logo/title linking back to homepage */}
        <Navbar.Brand as={NavLink} to="/">NextStepUofC</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {/* Common navigation links - regardless of login status */}
            <Nav.Link as={NavLink} to="/browse">Browse Jobs</Nav.Link>
            <Nav.Link as={NavLink} to="/forum">Community Forum</Nav.Link>

            {/* Show when logged in */}
            {token ? (
              <>
                {/* Dashboard link - based on role */}
                {userRole === 'student' && (
                  <Nav.Link as={NavLink} to="/student-dashboard">Dashboard</Nav.Link>
                )}
                
                {userRole === 'employer' && (
                  <Nav.Link as={NavLink} to="/employer-dashboard">Dashboard</Nav.Link>
                )}
                
                {userRole === 'moderator' && (
                  <Nav.Link as={NavLink} to="/student-dashboard">Dashboard</Nav.Link>
                )}
                
                {/* Role-specific navigation links */}
                {userRole === 'student' && (
                  <>
                    <Nav.Link as={NavLink} to="/application-history">My Applications</Nav.Link>
                  </>
                )}
                
                {userRole === 'employer' && (
                  <>
                    <Nav.Link as={NavLink} to="/manage-jobs">Manage Jobs</Nav.Link>
                    <Nav.Link as={NavLink} to="/company-applications">View Applicants</Nav.Link>
                  </>
                )}
                
                {userRole === 'moderator' && (
                  <>
                    <Nav.Link as={NavLink} to="/student-dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={NavLink} to="/student-verifications">Student Verifications</Nav.Link>
                    <Nav.Link as={NavLink} to="/employer-verifications">Employer Verifications</Nav.Link>
                    <Nav.Link as={NavLink} to="/job-moderation">Job Moderation</Nav.Link>
                  </>
                )}

                {/* Account dropdown with profile link and logout */}
                <NavDropdown 
                  title={
                    <span>
                      <i className="bi bi-person-circle me-1"></i>
                      {getDisplayName()}
                    </span>
                  } 
                  id="account-dropdown"
                >
                  <NavDropdown.Item as={NavLink} to="/account">
                    <i className="bi bi-gear me-2"></i>
                    Account Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={onLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              // Show login/register if not authenticated
              <>
                <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
                <Nav.Link as={NavLink} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
