// src/components/NavigationBar.js
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

function NavigationBar({ token, setToken }) {
  const userRole = localStorage.getItem('userRole'); // e.g., "recruiter" or "job_seeker"
  const username = localStorage.getItem('username'); // set during login

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
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
                {username && (
                  <Nav.Link as={NavLink} to="/account" className="me-3">
                    Signed in as: <strong>{username}</strong>
                  </Nav.Link>
                )}
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
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
