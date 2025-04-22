import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user info from localStorage
  const isLoggedIn = !!localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName');
  
  // Handle logout
  const handleLogout = () => {
    // Clear all localStorage items related to authentication
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('ucid');
    localStorage.removeItem('employerId');
    localStorage.removeItem('moderatorId');
    
    // Redirect to home page
    navigate('/');
  };
  
  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            alt="NextStep Logo"
            src="/logo192.png"
            width="30"
            height="30"
            className="d-inline-block align-top me-2"
          />
          NextStep
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/browse">
              Browse Jobs
            </Nav.Link>
            <Nav.Link as={NavLink} to="/forum">
              Community Forum
            </Nav.Link>
            
            {/* Student specific links */}
            {isLoggedIn && userRole === 'student' && (
              <>
                <Nav.Link as={NavLink} to="/student-dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/saved-jobs">
                  Saved Jobs
                </Nav.Link>
                <Nav.Link as={NavLink} to="/application-history">
                  Applications
                </Nav.Link>
              </>
            )}
            
            {/* Employer specific links */}
            {isLoggedIn && userRole === 'employer' && (
              <>
                <Nav.Link as={NavLink} to="/employer-dashboard">
                  Dashboard
                </Nav.Link>
                <Nav.Link as={NavLink} to="/post-job">
                  Post a Job
                </Nav.Link>
                <Nav.Link as={NavLink} to="/manage-jobs">
                  Manage Jobs
                </Nav.Link>
                <Nav.Link as={NavLink} to="/company-applications">
                  Applications
                </Nav.Link>
              </>
            )}
            
            {/* Moderator specific links */}
            {isLoggedIn && userRole === 'moderator' && (
              <Nav.Link as={NavLink} to="/moderator-dashboard">
                Dashboard
              </Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {isLoggedIn ? (
              <NavDropdown title={userName || 'Account'} id="basic-nav-dropdown" align="end">
                <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/settings">Settings</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-light" className="me-2">
                  Login
                </Button>
                <Button as={Link} to="/register" variant="light">
                  Sign Up
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation; 