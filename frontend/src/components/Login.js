import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login({ setToken, setUser }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    user_type: 'student'
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
        email: formData.email,  // Changed from username to email to match your model
        password: formData.password,
        user_type: formData.user_type  // Include user_type in the request
      });

      // Handle response
      const { access: token, refresh: refreshToken, user } = response.data;
      
      // Store authentication data
      localStorage.setItem('accessToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userData', JSON.stringify(user));
      
      // Update parent component state
      setToken(token);
      setUser(user);
      
      // Redirect based on user type
      const redirectPath = {
        student: '/student-dashboard',
        employer: '/employer-dashboard',
        moderator: '/moderator-dashboard'
      }[user.user_type] || '/';
      
      navigate(redirectPath);
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Enhanced error handling
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
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
        <Col md={8} lg={6}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">NextStep Login</h2>
              <p className="text-center text-muted mb-4">
                Enter your credentials to access your account
              </p>
              
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your registered email"
                    required
                    autoFocus
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
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    required
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
                    size="lg"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>

                <div className="d-flex justify-content-between">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <Link to="/forgot-password" className="text-primary">
                    Forgot password?
                  </Link>
                </div>
              </Form>
              
              <div className="mt-4 pt-3 border-top text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="fw-bold">
                    Register here
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;