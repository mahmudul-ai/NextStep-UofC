// Import React and Bootstrap components for layout and styling
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function NavigationBar({ token, setToken }) {
  // Get user role from localStorage (set during login)
  const userRole = localStorage.getItem('userRole'); // e.g., "student" or "employer" or "moderator"
  const username = localStorage.getItem('username');

  // Handle logout: clear all auth-related data and reset token state
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('ucid');
    localStorage.removeItem('employerId');
    localStorage.removeItem('moderatorId');
    setToken('');
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
                  <Nav.Link as={NavLink} to="/moderator-dashboard">Dashboard</Nav.Link>
                )}
                
                {/* Role-specific navigation links */}
                {userRole === 'student' && (
                  <>
                    <Nav.Link as={NavLink} to="/application-history">My Applications</Nav.Link>
                    <Nav.Link as={NavLink} to="/saved-jobs">Saved Jobs</Nav.Link>
                  </>
                )}
                
                {userRole === 'employer' && (
                  <>
                    <Nav.Link as={NavLink} to="/manage-jobs">Manage Jobs</Nav.Link>
                    <Nav.Link as={NavLink} to="/applications">View Applicants</Nav.Link>
                  </>
                )}
                
                {userRole === 'moderator' && (
                  <>
                    <Nav.Link as={NavLink} to="/student-verifications">Student Verifications</Nav.Link>
                    <Nav.Link as={NavLink} to="/employer-verifications">Employer Verifications</Nav.Link>
                    <Nav.Link as={NavLink} to="/job-moderation">Job Moderation</Nav.Link>
                  </>
                )}

                {/* Profile link - for all logged in users */}
                <Nav.Link as={NavLink} to="/account">
                  <i className="bi bi-person-circle me-1"></i>
                  Profile
                </Nav.Link>

                {/* Logout button */}
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
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
