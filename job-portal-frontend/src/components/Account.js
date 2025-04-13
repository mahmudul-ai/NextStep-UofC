// src/components/Account.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import api from '../services/api';

function Account() {
  // Assume that the username is stored in localStorage and that other details can be fetched from your backend.
  const storedUsername = localStorage.getItem('username');

  const [username, setUsername] = useState(storedUsername || '');
  const [bio, setBio] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch existing account details from the backend when the component mounts.
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await api.get('/account/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Example response: { username, bio }
        setUsername(response.data.username);
        setBio(response.data.bio);
      } catch (err) {
        console.error('Error fetching account details:', err);
        setError('Failed to load account details.');
      }
    };

    fetchAccountDetails();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      // Create a FormData object for text and file uploads
      const formData = new FormData();
      formData.append('bio', bio);
      // Append file only if provided
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      const response = await api.put('/account/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setMessage('Account updated successfully.');
      setError('');
      // Optionally, update local state if necessary.
    } catch (err) {
      console.error('Error updating account:', err);
      setError('Failed to update account.');
      setMessage('');
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-4">Account Details</Card.Title>
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" value={username} readOnly />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter your bio here..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Upload PDF</Form.Label>
                  <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Update Account
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Account;
