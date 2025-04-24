import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login({ setToken, setUser }) {
  // State for form fields, loading state, and error message
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Call the login API
      const response = await api.login(formData);
      
      // Extract data from response
      const { token, refresh_token, user } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('accessToken', token);
      if (refresh_token) {
        localStorage.setItem('refreshToken', refresh_token);
      }
      
      // Update state in parent component
      setToken(token);
      
      // Store user type in localStorage
      localStorage.setItem('userRole', user.user_type);
      localStorage.setItem('email', formData.email);
      
      // Store additional user info if available
      if (user.ucid) {
        localStorage.setItem('ucid', user.ucid);
      }
      
      if (user.company_name) {
        localStorage.setItem('companyName', user.company_name);
      }
      
      // Handle moderator role setting
      if (user.user_type === 'moderator') {
        console.log('User is a direct moderator');
        // Store moderator ID if available, or use ucid as fallback
        const moderatorId = user.moderator_id || user.ucid;
        if (moderatorId) {
          localStorage.setItem('moderatorId', moderatorId);
        }
      }
      
      // Update user state in parent component
      setUser(user);
      
      // Fetch additional user profile data
      const enrichedUser = await api.getUserProfile(user);
      
      // If the user is a student, check if they're also a moderator
      if (user.user_type === 'student' && user.ucid) {
        try {
          const moderatorResponse = await api.checkModeratorStatus(user.ucid);
          if (moderatorResponse.data.isModerator) {
            console.log('Student user is also a moderator:', moderatorResponse.data);
            localStorage.setItem('moderatorId', moderatorResponse.data.moderatorId);
            // Set additional flag for dual-role users
            localStorage.setItem('hasModeratorRole', 'true');
          }
        } catch (err) {
          console.error('Error checking moderator status:', err);
        }
      }
      
      // Redirect based on user type
      if (user.user_type === 'student') {
        navigate('/student-dashboard');
      } else if (user.user_type === 'employer') {
        navigate('/employer-dashboard');
      } else if (user.user_type === 'moderator') {
        navigate('/moderator-dashboard');
      } else {
        navigate('/');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow" style={{ maxWidth: '450px' }}>
        <Card.Header className="bg-primary text-white text-center">
          <h3 className="mb-0">Login to NextStep UofC</h3>
        </Card.Header>
        
        <Card.Body className="p-4">
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
                placeholder="Enter your password"
                required
              />
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </div>
          </Form>
          
          <div className="text-center mt-3">
            <p className="mb-0">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;