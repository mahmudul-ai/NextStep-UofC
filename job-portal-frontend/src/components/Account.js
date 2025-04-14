// Import necessary React hooks and UI components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import api from '../services/api';

function Account() {
  // Grab the username from localStorage — this assumes it's already stored during login
  const storedUsername = localStorage.getItem('username');

  // State hooks for user details and UI messages
  const [username, setUsername] = useState(storedUsername || '');
  const [bio, setBio] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // On initial render, fetch user details from the backend
  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await api.get('/account/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Set the fetched data into state
        setUsername(response.data.username);
        setBio(response.data.bio);
      } catch (err) {
        console.error('Error fetching account details:', err);
        setError('Failed to load account details.');
      }
    };

    fetchAccountDetails();
  }, []);

  // Handle PDF file selection
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  // Handle form submission to update bio and optional PDF file
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');

      // Use FormData to support sending both text and file data
      const formData = new FormData();
      formData.append('bio', bio);
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      // Make a PUT request to update the user profile
      const response = await api.put('/account/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('Account updated successfully.');
      setError('');
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

              {/* Success or error messages after submission */}
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Username is shown but not editable */}
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" value={username} readOnly />
                </Form.Group>

                {/* Editable bio field */}
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

                {/* File input for uploading a PDF */}
                <Form.Group className="mb-3">
                  <Form.Label>Upload PDF</Form.Label>
                  <Form.Control type="file" accept="application/pdf" onChange={handleFileChange} />
                </Form.Group>

                {/* Submit button */}
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
