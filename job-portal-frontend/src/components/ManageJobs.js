// src/components/ManageJobs.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import api from '../services/api';

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data);
    } catch (err) {
      console.error(err);
      setError("Error fetching jobs.");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handler to add a job
  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      // The backend will use request.user to set posted_by if the user is a recruiter.
      await api.post('/jobs/', { title, description, location });
      setMessage("Job added successfully.");
      setError("");
      // Clear form fields
      setTitle('');
      setDescription('');
      setLocation('');
      // Refresh job list
      fetchJobs();
    } catch (err) {
      console.error(err);
      setError("Failed to add job. Are you sure you're logged in as a recruiter?");
    }
  };

  // Handler to delete a job
  const handleDeleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}/`);
      setMessage("Job deleted successfully.");
      setError("");
      fetchJobs();
    } catch (err) {
      console.error(err);
      setError("Failed to delete job.");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Manage Jobs</h2>
      {error && <p className="text-danger">{error}</p>}
      {message && <p className="text-success">{message}</p>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4>Add New Job</h4>
          <Form onSubmit={handleAddJob}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Job title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Job description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                placeholder="Location (e.g., Remote, Onsite)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-grid">
              <Button variant="primary" type="submit">Add Job</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <h4>Existing Jobs</h4>
      <Row className="g-4">
        {jobs.map(job => (
          <Col key={job.id} xs={12} md={6} lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{job.title}</Card.Title>
                <Card.Text>{job.description}</Card.Text>
                <Card.Text>
                  <small className="text-muted">Location: {job.location}</small>
                </Card.Text>
              </Card.Body>
              <Card.Footer className="bg-white border-top-0">
                <Button variant="danger" size="sm" onClick={() => handleDeleteJob(job.id)}>
                  Delete
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ManageJobs;
