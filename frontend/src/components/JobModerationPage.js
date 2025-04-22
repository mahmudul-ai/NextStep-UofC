import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

function JobModerationPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [moderationStatus, setModerationStatus] = useState('Approved');
  const [moderationNotes, setModerationNotes] = useState('');
  const [moderationInProgress, setModerationInProgress] = useState(false);

  // Fetch jobs that need moderation
  useEffect(() => {
    const fetchJobsForModeration = async () => {
      try {
        setLoading(true);
        
        // Since we're using mock data, let's just get all jobs and pretend they need moderation
        const response = await api.getJobs();
        // Filter to only show jobs from pending verification employers
        const results = response.data.filter(job => 
          job.employerId === 3 // Alberta Healthcare Systems has 'Pending' verification in our mock data
        );
        
        setJobs(results);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs for moderation:", err);
        setError("Failed to load jobs for moderation. Please try again later.");
        setLoading(false);
      }
    };

    fetchJobsForModeration();
  }, []);

  // Handle opening the moderation modal
  const handleModerate = (job) => {
    setSelectedJob(job);
    setModerationStatus('Approved');
    setModerationNotes('');
    setShowModal(true);
  };

  // Handle submitting moderation decision
  const handleSubmitModeration = async () => {
    try {
      setModerationInProgress(true);
      
      // Call a mock API to update job moderation status
      // In a real app, this would create a JobModeration record
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update local state to reflect changes
      setJobs(jobs.filter(j => j.jobId !== selectedJob.jobId));
      
      // Close modal and reset state
      setShowModal(false);
      setSelectedJob(null);
      setModerationInProgress(false);
      
    } catch (err) {
      console.error("Error updating job moderation status:", err);
      setError("Failed to update job moderation status. Please try again.");
      setModerationInProgress(false);
    }
  };

  // Format salary with currency symbol
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Job Moderation</h2>
          <p className="text-muted">Review and approve job postings before they go live</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/moderator-dashboard" variant="outline-primary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {jobs.length === 0 ? (
        <Alert variant="info">
          No jobs pending moderation at this time.
        </Alert>
      ) : (
        <Card>
          <Card.Header>
            <Row>
              <Col>Jobs Pending Moderation ({jobs.length})</Col>
            </Row>
          </Card.Header>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Salary</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.jobId}>
                  <td>{job.jobTitle}</td>
                  <td>
                    {job.companyName}
                    <Badge bg="warning" className="ms-2">Pending Verification</Badge>
                  </td>
                  <td>{formatSalary(job.salary)}</td>
                  <td>{job.location}</td>
                  <td>{job.deadline}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="me-2"
                      onClick={() => handleModerate(job)}
                    >
                      Review
                    </Button>
                    <Button
                      as={Link}
                      to={`/jobs/${job.jobId}`}
                      variant="outline-secondary"
                      size="sm"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Job Moderation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Job Posting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <>
              <h5>{selectedJob.jobTitle}</h5>
              <p className="text-muted">{selectedJob.companyName} • {selectedJob.location}</p>
              
              <hr />
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Salary:</strong> {formatSalary(selectedJob.salary)}
                </Col>
                <Col md={6}>
                  <strong>Deadline:</strong> {selectedJob.deadline}
                </Col>
              </Row>
              
              <div className="mb-4">
                <strong>Job Description:</strong>
                <p className="mt-2">{selectedJob.description}</p>
              </div>
              
              <Alert variant="warning">
                <strong>Note:</strong> This company is pending verification.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label>Moderation Decision</Form.Label>
                <Form.Select 
                  value={moderationStatus} 
                  onChange={(e) => setModerationStatus(e.target.value)}
                >
                  <option value="Approved">Approve Job Posting</option>
                  <option value="Rejected">Reject Job Posting</option>
                  <option value="Needs Revision">Requires Revisions</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Moderation Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Optional moderation notes or feedback for the employer"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={
              moderationStatus === 'Approved' ? 'success' : 
              moderationStatus === 'Rejected' ? 'danger' : 'warning'
            } 
            onClick={handleSubmitModeration}
            disabled={moderationInProgress}
          >
            {moderationInProgress ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Processing...</span>
              </>
            ) : (
              moderationStatus === 'Approved' ? 'Approve Job' : 
              moderationStatus === 'Rejected' ? 'Reject Job' : 'Request Revisions'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default JobModerationPage; 