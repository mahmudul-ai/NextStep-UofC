import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const ucid = localStorage.getItem('ucid');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!ucid || userRole !== 'student') {
      navigate('/login');
    }
  }, [ucid, userRole, navigate]);
  
  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        setLoading(true);
        const response = await api.getSavedJobs(ucid);
        setSavedJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching saved jobs:", err);
        setError("Failed to load saved jobs. Please try again later.");
        setLoading(false);
      }
    };
    
    if (ucid) {
      fetchSavedJobs();
    }
  }, [ucid]);
  
  // Handle unsaving a job
  const handleUnsaveJob = async (jobId) => {
    try {
      await api.unsaveJob(ucid, jobId);
      // Remove job from list
      setSavedJobs(savedJobs.filter(savedJob => savedJob.jobId !== jobId));
    } catch (err) {
      console.error("Error unsaving job:", err);
      setError("Failed to unsave job. Please try again.");
    }
  };
  
  // Format currency
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };
  
  // Calculate days remaining until deadline
  const calculateDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get badge color based on days remaining
  const getDeadlineBadgeVariant = (daysRemaining) => {
    if (daysRemaining <= 0) return 'danger';
    if (daysRemaining <= 3) return 'warning';
    if (daysRemaining <= 7) return 'info';
    return 'success';
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
  
  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Saved Jobs</h2>
          <p className="text-muted">Jobs you've saved for later</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/" variant="outline-primary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Empty state */}
      {savedJobs.length === 0 && !loading && (
        <Alert variant="info">
          You haven't saved any jobs yet. Browse jobs and save the ones you're interested in.
          <div className="mt-3">
            <Button as={Link} to="/browse" variant="primary">Browse Jobs</Button>
          </div>
        </Alert>
      )}
      
      {/* Saved jobs list */}
      {savedJobs.length > 0 && (
        <Card>
          <Card.Header>
            <Row>
              <Col>You have {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}</Col>
            </Row>
          </Card.Header>
          <ListGroup variant="flush">
            {savedJobs.map((savedJob) => {
              const job = savedJob.job;
              const daysRemaining = job ? calculateDaysRemaining(job.deadline) : 0;
              
              return (
                <ListGroup.Item key={savedJob.savedJobId}>
                  <Row>
                    <Col md={8}>
                      <h5 className="mb-1">{job.jobTitle}</h5>
                      <p className="mb-1 text-muted">{job.companyName} • {job.location}</p>
                      <div>
                        <Badge bg="secondary" className="me-2">{formatSalary(job.salary)}</Badge>
                        {daysRemaining > 0 ? (
                          <Badge bg={getDeadlineBadgeVariant(daysRemaining)} className="me-2">
                            {daysRemaining} days remaining
                          </Badge>
                        ) : (
                          <Badge bg="danger" className="me-2">Deadline passed</Badge>
                        )}
                        <small className="text-muted">Saved on: {new Date(savedJob.dateSaved).toLocaleDateString()}</small>
                      </div>
                    </Col>
                    <Col md={4} className="d-flex justify-content-end align-items-center">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="me-2"
                        onClick={() => handleUnsaveJob(job.jobId)}
                      >
                        <i className="bi bi-bookmark-x me-1"></i>
                        Unsave
                      </Button>
                      <Button
                        as={Link}
                        to={`/jobs/${job.jobId}`}
                        variant="primary"
                        size="sm"
                      >
                        View Job
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
}

export default SavedJobs; 