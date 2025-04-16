// Import React and Bootstrap components for layout and styling
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function NavigationBar({ token, setToken }) {
  // Get user role and username from localStorage (set during login)
  const userRole = localStorage.getItem('userRole'); // e.g., "recruiter" or "job_seeker"
  const username = localStorage.getItem('username');

  // Handle logout: clear all auth-related data and reset token state
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
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
            {/* Always show "Browse Jobs" */}
            <Nav.Link as={NavLink} to="/browse">Browse Jobs</Nav.Link>

            {/* Show when logged in */}
            {token ? (
              <>
                {/* Show "Manage Jobs" only for recruiters */}
                {userRole === 'recruiter' && (
                  <Nav.Link as={NavLink} to="/manage">Manage Jobs</Nav.Link>
                )}
                {userRole === 'recruiter' && (
                <Nav.Link as={NavLink} to="/applications">View Applications</Nav.Link>    
                )}

                {/* Show username info if available */}
                {username && (
                  <Nav.Link as={NavLink} to="/account" className="me-3">
                    Signed in as: <strong>{username}</strong>
                  </Nav.Link>
                )}

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
