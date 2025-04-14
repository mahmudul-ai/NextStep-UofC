// Import React tools and components for layout, form, and navigation
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Hook for programmatic navigation
import api from '../services/api'; // Axios instance for backend API calls

function Login({ setToken }) {
  // State for login form inputs and error message
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();  // Hook to redirect user after login

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Get JWT token
      const response = await api.post('/token/', { username, password });
      const token = response.data.access;
  
      // Step 2: Save token
      localStorage.setItem('accessToken', token);
  
      // Step 3: Fetch user info to get their role
      const userResponse = await api.get('/account/', {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const userData = userResponse.data;
      localStorage.setItem('userRole', userData.user_type); // <- actual role from backend
      localStorage.setItem('username', userData.username);
  
      // Step 4: Update app state and redirect
      setToken(token);
      setError('');
      navigate('/browse');
    } catch (err) {
      console.error("Login failed", err);
      setError('Login failed. Please check your credentials.');
    }
  };
  

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 shadow">
            <Card.Body>
              <h3 className="mb-4 text-center">Login</h3>

              {/* Show error message if login fails */}
              {error && <p className="text-danger text-center">{error}</p>}

              {/* Login form */}
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                {/* Submit button spans full width */}
                <div className="d-grid">
                  <Button variant="primary" type="submit">Login</Button>
                </div>
              </Form>

              {/* Registration link */}
              <div className="mt-3 text-center">
                Don't have an account? <a href="/register">Register here</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
