// Import necessary React hooks and UI components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import api from '../services/api'; // Axios instance with token handling

function ManageJobs() {
  // State for job list and job form inputs
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // This state tracks which job is being edited (null = add mode)
  const [editingJobId, setEditingJobId] = useState(null);

  // Fetch only the recruiter's jobs from backend (automatically filtered by backend)
  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/');
      setJobs(response.data); // Set job list in state
    } catch (err) {
      console.error(err);
      setError("Error fetching jobs.");
    }
  };

  // Fetch jobs when component mounts
  useEffect(() => {
    fetchJobs();
  }, []);

  // Handler for submitting job form (add or edit depending on state)
  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJobId) {
        // Update existing job
        await api.put(`/jobs/${editingJobId}/`, { title, description, location });
        setMessage("Job updated successfully.");
      } else {
        // Create new job
        await api.post('/jobs/', { title, description, location });
        setMessage("Job added successfully.");
      }

      // Clear form and refresh job list
      setTitle('');
      setDescription('');
      setLocation('');
      setEditingJobId(null);
      setError('');
      fetchJobs();
    } catch (err) {
      console.error(err);
      setError("Failed to save job.");
      setMessage('');
    }
  };

  // Handler to delete a job
  const handleDeleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}/`);
      setMessage("Job deleted successfully.");
      setError('');
      fetchJobs();
    } catch (err) {
      console.error(err);
      setError("Failed to delete job.");
    }
  };

  // Handler to begin editing a job — populate form fields
  const handleEditClick = (job) => {
    setTitle(job.title);
    setDescription(job.description);
    setLocation(job.location);
    setEditingJobId(job.id);
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Manage Jobs</h2>

      {/* Display error or success message */}
      {error && <p className="text-danger">{error}</p>}
      {message && <p className="text-success">{message}</p>}

      {/* Form for adding or editing a job */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4>{editingJobId ? 'Edit Job' : 'Add New Job'}</h4>
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

            {/* Submit button */}
            <div className="d-grid">
              <Button variant="primary" type="submit">
                {editingJobId ? 'Update Job' : 'Add Job'}
              </Button>
            </div>

            {/* Cancel editing button (only shows in edit mode) */}
            {editingJobId && (
              <div className="mt-2 text-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setEditingJobId(null);
                    setTitle('');
                    setDescription('');
                    setLocation('');
                  }}
                >
                  Cancel Edit
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Job cards section */}
      <h4>Existing Jobs</h4>
      <Row className="g-4">
        {jobs.map((job) => (
          <Col key={job.id} xs={12} md={6} lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>{job.title}</Card.Title>
                <Card.Text>{job.description}</Card.Text>
                <Card.Text>
                  <small className="text-muted">Location: {job.location}</small>
                </Card.Text>
              </Card.Body>

              <Card.Footer className="bg-white border-top-0 d-flex justify-content-between">
                {/* Edit and delete buttons for each job */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleEditClick(job)}
                >
                  Edit
                </Button>
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
