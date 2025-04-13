// src/components/Login.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import api from '../services/api';

function Login({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/token/', { username, password });
      const token = response.data.access;
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userRole', 'recruiter'); // or 'job_seeker'
      // Save the username from the input in localStorage:
      localStorage.setItem('username', username);
      
      setToken(token);
      setError('');
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
              {error && <p className="text-danger text-center">{error}</p>}
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
                <div className="d-grid">
                  <Button variant="primary" type="submit">Login</Button>
                </div>
              </Form>
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
