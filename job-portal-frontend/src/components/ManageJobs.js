// Import necessary React hooks and UI components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import api from '../services/api'; // Axios instance for making API requests

function ManageJobs() {
  // State for job list and form inputs
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Fetch job listings from the backend
  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data); // Store the fetched jobs in state
    } catch (err) {
      console.error(err);
      setError("Error fetching jobs.");
    }
  };

  // Fetch jobs when the component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Handler to submit a new job posting
  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      // Backend sets 'posted_by' automatically based on the logged-in user
      await api.post('/jobs/', { title, description, location });

      // Success feedback and reset
      setMessage("Job added successfully.");
      setError("");
      setTitle('');
      setDescription('');
      setLocation('');
      fetchJobs(); // Refresh job list
    } catch (err) {
      console.error(err);
      setError("Failed to add job. Are you sure you're logged in as a recruiter?");
    }
  };

  // Handler to delete an existing job
  const handleDeleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}/`);
      setMessage("Job deleted successfully.");
      setError("");
      fetchJobs(); // Refresh job list after deletion
    } catch (err) {
      console.error(err);
      setError("Failed to delete job.");
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Manage Jobs</h2>
      {/* Display success or error messages */}
      {error && <p className="text-danger">{error}</p>}
      {message && <p className="text-success">{message}</p>}

      {/* Form to add a new job */}
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

      {/* List of existing jobs with option to delete each */}
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
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                >
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
