// src/components/NavigationBar.js
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function NavigationBar({ token, setToken }) {
  // For demonstration, let's assume we store the role in localStorage after login.
  const userRole = localStorage.getItem('userRole'); // e.g., "recruiter" or "job_seeker"

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    setToken('');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={NavLink} to="/">NextStepUofC</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={NavLink} to="/browse">Browse Jobs</Nav.Link>
            {token ? (
              <>
                {userRole === 'recruiter' && (
                  <Nav.Link as={NavLink} to="/manage">Manage Jobs</Nav.Link>
                )}
                <Button variant="outline-light" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
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
