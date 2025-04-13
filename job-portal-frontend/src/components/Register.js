// src/components/Register.js
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import api from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]  = useState('');
  const [email, setEmail]        = useState('');
  const [password, setPassword]  = useState('');
  const [confirm, setConfirm]    = useState('');
  const [role, setRole]          = useState('');
  const [ucid, setUcid]          = useState('');
  const [error, setError]        = useState('');
  const [message, setMessage]    = useState('');
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register button clicked!');
    // Basic validation: check passwords match
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    // Build payload. Adjust field names if your backend expects different ones.
    const payload = {
      username,
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      user_type: role
    };
    if (role === 'job_seeker') {
      payload.ucid = parseInt(ucid, 10);
    }
    try {
      const response = await api.post('/register/', payload);
      console.log('Registration successful!', response.data);
      setMessage("Registration successful! Please wait for admin approval if you're a job seeker.");
      setError('');
      // Reset form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirm('');
      setRole('');
      setUcid('');
    } catch (err) {
      console.error('Registration failed', err);
      setError('Registration failed. Please try again.');
      setMessage('');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={4}>
          <Card className="p-4 shadow">
            <Card.Body>
              <h3 className="mb-4 text-center">Register</h3>
              {error && <p className="text-danger text-center">{error}</p>}
              {message && <p className="text-success text-center">{message}</p>}
              <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                 <Form.Label>Username</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                <Form.Group className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Select Role</Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="job_seeker">Job Seeker</option>
                    <option value="recruiter">Recruiter</option>
                  </Form.Select>
                </Form.Group>
                {role === 'job_seeker' && (
                  <Form.Group className="mb-3">
                    <Form.Label>UCID</Form.Label>
                    <Form.Control
                      type="number"
                      value={ucid}
                      onChange={(e) => setUcid(e.target.value)}
                      required
                    />
                  </Form.Group>
                )}
                <div className="d-grid">
                  <Button variant="primary" type="submit">Register</Button>
                </div>
              </Form>
              <div className="mt-3 text-center">
                Already have an account? <a href="/login">Login here</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
