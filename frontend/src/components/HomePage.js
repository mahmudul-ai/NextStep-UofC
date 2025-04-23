// Import React and routing/styling tools
import React, { useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css'; // External CSS for styling the homepage

// Functional component for the homepage
const HomePage = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAuthenticated = localStorage.getItem('accessToken') || 
    localStorage.getItem('ucid') || 
    localStorage.getItem('employerId') || 
    localStorage.getItem('moderatorId');
  
  useEffect(() => {
    // Redirect to appropriate dashboard if logged in
    if (isAuthenticated && userRole) {
      switch (userRole) {
        case 'student':
          navigate('/student-dashboard');
          break;
        case 'employer':
          navigate('/employer-dashboard');
          break;
        case 'moderator':
          navigate('/moderator-dashboard');
          break;
        default:
          // Stay on homepage if no valid role
          break;
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  return (
    <div className="homepage">
      <Container className="py-5">
        <Row className="mb-5 text-center">
          <Col>
            <h1 className="display-4 mb-4">Welcome to NextStep</h1>
            <p className="lead">
              Connecting University of Calgary students with career opportunities
            </p>
            <div className="mt-4">
              <Button as={Link} to="/register" variant="primary" size="lg" className="me-3">
                Sign Up
              </Button>
              <Button as={Link} to="/login" variant="outline-primary" size="lg">
                Login
              </Button>
            </div>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col md={4} className="mb-4">
            <div className="text-center mb-3">
              <i className="bi bi-mortarboard homepage-icon"></i>
            </div>
            <h3 className="text-center">For Students</h3>
            <p>Find internships and job opportunities, connect with employers, and build your career.</p>
          </Col>
          <Col md={4} className="mb-4">
            <div className="text-center mb-3">
              <i className="bi bi-building homepage-icon"></i>
            </div>
            <h3 className="text-center">For Employers</h3>
            <p>Post job openings, find talented students, and build your connection with the University of Calgary.</p>
          </Col>
          <Col md={4} className="mb-4">
            <div className="text-center mb-3">
              <i className="bi bi-people homepage-icon"></i>
            </div>
            <h3 className="text-center">Community</h3>
            <p>Join discussions, share insights, and connect with peers and professionals in your field.</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
