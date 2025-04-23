import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login({ setToken, setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: 'student' // Default to student login
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      
      // API call to Django backend
      const response = await api.post('/login/', {
        username: formData.email, // Django typically uses 'username' field
        password: formData.password
      });

      // Handle Django REST Framework token response
      const { token, user } = response.data;
      
      // Store authentication data
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update parent component state
      setToken(token);
      setUser(user);
      
      // Redirect based on user type
      switch(user.user_type) {
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
          navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error response formats
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail; // DRF default error format
        } else if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(' ');
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Login As</Form.Label>
                  <Form.Select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                    <option value="moderator">Moderator</option>
                  </Form.Select>
                </Form.Group>
                
                <div className="d-grid mb-3">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>

                <div className="text-center">
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              </Form>
              
              <div className="mt-4 pt-3 border-top text-center">
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
              </div>

              {/* Development/testing only - remove in production
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-3 pt-3 border-top">
                  <small className="text-muted d-block text-center mb-2">
                    Test Accounts (dev only):
                  </small>
                  <div className="text-center">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-2 mb-2"
                      onClick={() => setFormData({
                        email: 'student@ucalgary.ca',
                        password: 'testpass123',
                        user_type: 'student'
                      })}
                    >
                      Student
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-2 mb-2"
                      onClick={() => setFormData({
                        email: 'employer@company.com',
                        password: 'testpass123',
                        user_type: 'employer'
                      })}
                    >
                      Employer
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="mb-2"
                      onClick={() => setFormData({
                        email: 'moderator@nextstep.ca',
                        password: 'testpass123',
                        user_type: 'moderator'
                      })}
                    >
                      Moderator
                    </Button>
                  </div>
                </div>
              )} */}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;