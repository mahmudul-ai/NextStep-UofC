import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Form, Modal, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function CompanyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [jobListings, setJobListings] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  const navigate = useNavigate();
  const employerId = localStorage.getItem('employerId');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!employerId || userRole !== 'employer') {
      navigate('/login');
    }
  }, [employerId, userRole, navigate]);
  
  // Fetch applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get all applications for this company
        const applicationsResponse = await api.getCompanyApplications(employerId);
        setApplications(applicationsResponse.data);
        
        // Get all job listings for this company (for filtering)
        const jobsResponse = await api.getCompanyJobs(employerId);
        setJobListings(jobsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load applications. Please try again later.");
        setLoading(false);
      }
    };
    
    if (employerId) {
      fetchData();
    }
  }, [employerId]);
  
  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'reviewed':
        return 'info';
      case 'rejected':
        return 'danger';
      case 'interview':
      case 'interview scheduled':
        return 'primary';
      case 'accepted':
        return 'success';
      case 'under review':
        return 'info';
      case 'submitted':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  // Format status for display
  const formatStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pending Review';
      case 'reviewed':
        return 'Under Consideration';
      case 'rejected':
        return 'Not Selected';
      case 'interview':
      case 'interview scheduled':
        return 'Interview Stage';
      case 'accepted':
        return 'Offer Extended';
      case 'under review':
        return 'Under Review';
      case 'submitted':
        return 'Submitted';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Filter applications based on search and job selection
  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesJob = selectedJob === 'all' || application.job.jobId === parseInt(selectedJob);
    
    return matchesSearch && matchesJob;
  });
  
  // Group applications by status
  const pendingApplications = filteredApplications.filter(app => 
    ['pending', 'submitted'].includes(app.status.toLowerCase())
  );
  
  const reviewedApplications = filteredApplications.filter(app => 
    ['reviewed', 'interview', 'interview scheduled', 'under review'].includes(app.status.toLowerCase())
  );
  
  const completedApplications = filteredApplications.filter(app => 
    ['rejected', 'accepted'].includes(app.status.toLowerCase())
  );
  
  // Open feedback modal
  const handleOpenFeedbackModal = (application, initialStatus) => {
    setCurrentApplication(application);
    setFeedback(application.feedback || '');
    setNewStatus(initialStatus || application.status);
    setShowFeedbackModal(true);
  };
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (!currentApplication) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update application with feedback and new status
      await api.updateApplicationFeedback(
        currentApplication.applicationId, 
        {
          status: newStatus,
          feedback: feedback
        }
      );
      
      // Update local state
      const updatedApplications = applications.map(app => {
        if (app.applicationId === currentApplication.applicationId) {
          return { 
            ...app, 
            status: newStatus, 
            feedback: feedback,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return app;
      });
      
      setApplications(updatedApplications);
      setShowFeedbackModal(false);
      setUpdatingStatus(false);
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status. Please try again.");
      setUpdatingStatus(false);
    }
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
          <h2>Manage Applications</h2>
          <p className="text-muted">Review and respond to applications received for your job postings</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/employer-dashboard" variant="outline-primary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-md-0">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by applicant name or job title"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Job</Form.Label>
                <Form.Select 
                  value={selectedJob} 
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="all">All Jobs</option>
                  {jobListings.map(job => (
                    <option key={job.jobId} value={job.jobId}>
                      {job.jobTitle}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Empty state */}
      {applications.length === 0 && !loading && (
        <Alert variant="info">
          You haven't received any applications yet. Make sure your job listings are active and visible.
          <div className="mt-3">
            <Button as={Link} to="/post-job" variant="primary">Post a New Job</Button>
          </div>
        </Alert>
      )}
      
      {/* Applications list */}
      {applications.length > 0 && (
        <Tabs defaultActiveKey="pending" id="application-tabs" className="mb-3">
          <Tab eventKey="pending" title={`Pending (${pendingApplications.length})`}>
            {pendingApplications.length === 0 ? (
              <Alert variant="info">No pending applications to review.</Alert>
            ) : (
              <Card>
                <ListGroup variant="flush">
                  {pendingApplications.map((application) => (
                    <ListGroup.Item key={application.applicationId}>
                      <Row>
                        <Col md={6}>
                          <h5 className="mb-1">{application.student.name}</h5>
                          <p className="mb-1 text-muted">
                            Applying for: <strong>{application.job.jobTitle}</strong>
                          </p>
                          <p className="mb-1">
                            <small className="text-muted">
                              Applied on: {new Date(application.dateApplied).toLocaleDateString()}
                            </small>
                          </p>
                        </Col>
                        <Col md={6} className="d-flex justify-content-end align-items-center">
                          {application.resumeUrl && (
                            <Button
                              onClick={() => window.open(`/resumes/${application.resumeUrl}`, '_blank')}
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                            >
                              View Resume
                            </Button>
                          )}
                          <Button
                            onClick={() => handleOpenFeedbackModal(application, 'reviewed')}
                            variant="primary"
                            size="sm"
                          >
                            Review Application
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            )}
          </Tab>
          
          <Tab eventKey="in-progress" title={`In Progress (${reviewedApplications.length})`}>
            {reviewedApplications.length === 0 ? (
              <Alert variant="info">No applications currently in progress.</Alert>
            ) : (
              <Card>
                <ListGroup variant="flush">
                  {reviewedApplications.map((application) => (
                    <ListGroup.Item key={application.applicationId}>
                      <Row>
                        <Col md={6}>
                          <h5 className="mb-1">{application.student.name}</h5>
                          <p className="mb-1 text-muted">
                            Applying for: <strong>{application.job.jobTitle}</strong>
                          </p>
                          <div>
                            <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                              {formatStatus(application.status)}
                            </Badge>
                            <small className="text-muted">
                              Applied on: {new Date(application.dateApplied).toLocaleDateString()}
                            </small>
                          </div>
                        </Col>
                        <Col md={6} className="d-flex justify-content-end align-items-center">
                          {application.resumeUrl && (
                            <Button
                              onClick={() => window.open(`/resumes/${application.resumeUrl}`, '_blank')}
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                            >
                              View Resume
                            </Button>
                          )}
                          <div className="btn-group">
                            <Button
                              onClick={() => handleOpenFeedbackModal(application, 'interview')}
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                            >
                              Schedule Interview
                            </Button>
                            <Button
                              onClick={() => handleOpenFeedbackModal(application, 'rejected')}
                              variant="outline-danger"
                              size="sm"
                              className="me-2"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleOpenFeedbackModal(application, 'accepted')}
                              variant="outline-success"
                              size="sm"
                            >
                              Accept
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            )}
          </Tab>
          
          <Tab eventKey="completed" title={`Completed (${completedApplications.length})`}>
            {completedApplications.length === 0 ? (
              <Alert variant="info">No completed applications yet.</Alert>
            ) : (
              <Card>
                <ListGroup variant="flush">
                  {completedApplications.map((application) => (
                    <ListGroup.Item key={application.applicationId}>
                      <Row>
                        <Col md={8}>
                          <h5 className="mb-1">{application.student.name}</h5>
                          <p className="mb-1 text-muted">
                            Applied for: <strong>{application.job.jobTitle}</strong>
                          </p>
                          <div>
                            <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                              {formatStatus(application.status)}
                            </Badge>
                            <small className="text-muted">
                              Applied on: {new Date(application.dateApplied).toLocaleDateString()}
                            </small>
                            {application.feedback && (
                              <p className="mt-2 mb-0">
                                <strong>Feedback:</strong> {application.feedback}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end align-items-center">
                          {application.resumeUrl && (
                            <Button
                              onClick={() => window.open(`/resumes/${application.resumeUrl}`, '_blank')}
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                            >
                              View Resume
                            </Button>
                          )}
                          <Button
                            onClick={() => handleOpenFeedbackModal(application)}
                            variant="outline-primary"
                            size="sm"
                          >
                            Update Status
                          </Button>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            )}
          </Tab>
        </Tabs>
      )}
      
      {/* Feedback/Status Update Modal */}
      <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {newStatus === currentApplication?.status 
              ? 'Update Application Feedback' 
              : `Change Status to ${formatStatus(newStatus)}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentApplication && (
            <>
              <p>
                <strong>Applicant:</strong> {currentApplication.student.name}<br />
                <strong>Position:</strong> {currentApplication.job.jobTitle}<br />
                <strong>Current Status:</strong> {formatStatus(currentApplication.status)}
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>Application Status</Form.Label>
                <Form.Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Under Consideration</option>
                  <option value="interview">Interview Stage</option>
                  <option value="rejected">Not Selected</option>
                  <option value="accepted">Offer Extended</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group>
                <Form.Label>Feedback / Notes to Applicant</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback for the applicant..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={updatingStatus}
          >
            {updatingStatus ? 'Updating...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CompanyApplications; 