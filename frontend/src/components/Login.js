// Import React tools and components for layout, form, and navigation
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom'; // Hook for programmatic navigation
import api from '../services/api'; // Axios instance for backend API calls

function Login({ setToken, setUser }) {
  // State for login form inputs and error message
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();  // Hook to redirect user after login

  // INTEGRATION POINT #1:
  // Login form submission
  // When integrating with Django, you'll need to ensure this
  // matches the expected format for Django REST Framework's token authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // INTEGRATION POINT #2:
      // API call to Django backend
      // For Django integration, ensure your backend returns:
      // - An authentication token
      // - User information including role/type
      const response = await api.login({ email, password });
      
      // INTEGRATION POINT #3:
      // Token and user information storage
      // Adjust these based on your Django backend response format
      // Expected format from Django might be:
      // {
      //   token: "your-auth-token",
      //   user: {
      //     id: 1,
      //     email: "user@example.com",
      //     username: "username",
      //     role: "student" | "employer" | "moderator"
      //   }
      // }
      
      // Store token in localStorage
      localStorage.setItem('accessToken', response.data.token);
      
      // Store user info in localStorage based on role
      if (response.data.role === 'student') {
        localStorage.setItem('ucid', response.data.user.ucid);
        localStorage.setItem('userRole', 'student');
      } else if (response.data.role === 'employer') {
        localStorage.setItem('employerId', response.data.user.employerId);
        localStorage.setItem('userRole', 'employer');
      } else if (response.data.role === 'moderator') {
        localStorage.setItem('moderatorId', response.data.user.moderatorId);
        localStorage.setItem('userRole', 'moderator');
      }
      
      // Update parent component state
      setToken(response.data.token);
      setUser(response.data.user);
      
      // INTEGRATION POINT #4:
      // Redirect based on user role
      // This doesn't need to change, but ensure your Django backend
      // provides the correct role information
      if (response.data.role === 'student') {
        navigate('/student-dashboard');
      } else if (response.data.role === 'employer') {
        navigate('/employer-dashboard');
      } else if (response.data.role === 'moderator') {
        navigate('/moderator-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      // INTEGRATION POINT #5:
      // Error handling for Django authentication
      // Adjust based on your Django error response format
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };
  
  // Function to provide placeholder text based on selected role
  const getEmailPlaceholder = () => {
    switch(role) {
      case 'student':
        return 'student@ucalgary.ca';
      case 'employer':
        return 'employer@company.com';
      case 'moderator':
        return 'moderator@nextstep.ca';
      default:
        return 'Email address';
    }
  };

  // Login credentials for testing
  const testCredentials = {
    student: 'john.doe@ucalgary.ca',
    employer: 'careers@ucalgary.ca',
    moderator: 'admin@nextstep.ca'
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Login to NextStep</h3>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </Form.Group>
                
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>
              </Form>
              
              <div className="mt-3 text-center">
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
              </div>
              
              {/* INTEGRATION POINT #6:
                  Sample login credentials for testing
                  Remove this in production or when connecting to real backend */}
              <div className="mt-4 border-top pt-3">
                <small className="text-muted d-block text-center mb-2">Sample Logins (for testing):</small>
                <div className="d-flex justify-content-between">
                  <small className="text-muted">
                    <strong>Student:</strong> john.doe@ucalgary.ca / password
                  </small>
                  <small className="text-muted">
                    <strong>Employer:</strong> careers@ucalgary.ca / password
                  </small>
                  <small className="text-muted">
                    <strong>Moderator:</strong> admin@nextstep.ca / password
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
