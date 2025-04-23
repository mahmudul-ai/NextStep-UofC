import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [message, setMessage] = useState('');

  const employerId = localStorage.getItem('employerId');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized to view this page
  useEffect(() => {
    if (userRole !== 'employer') {
      navigate('/login');
    }
  }, [userRole, navigate]);
  
  // Fetch application details
  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        setLoading(true);
        const response = await api.getApplicationDetail(parseInt(id));
        
        if (response?.data) {
          setApplication(response.data);
          setSelectedStatus(response.data.status);
          setFeedback(response.data.feedback || '');
        } else {
          setError('Application not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application details. Please try again later.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchApplicationDetails();
    }
  }, [id]);
  
  // Handle status update
  const handleUpdateStatus = async () => {
    try {
      setLoading(true);
      await api.updateApplicationStatus(application.applicationId, selectedStatus, feedback);
      
      // Update local state
      setApplication({
        ...application,
        status: selectedStatus,
        feedback,
        lastUpdated: new Date().toISOString()
      });
      
      setMessage('Application status updated successfully');
      setLoading(false);
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application status. Please try again.');
      setLoading(false);
    }
  };
  
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'submitted':
        return 'warning';
      case 'reviewed':
      case 'under review':
        return 'info';
      case 'rejected':
        return 'danger';
      case 'interview':
      case 'interview scheduled':
        return 'primary';
      case 'accepted':
      case 'offer extended':
        return 'success';
      default:
        return 'secondary';
    }
  };
  
  // Format status text
  const formatStatus = (status) => {
    switch (status?.toLowerCase()) {
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
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading application details...</span>
        </Spinner>
      </Container>
    );
  }
  
  if (error || !application) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error || 'Application not found'}</Alert>
        <Button as={Link} to="/applications" variant="primary">
          Back to Applications
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <h2>Application Details</h2>
          <p className="text-muted">Review and manage candidate application</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/applications" variant="outline-primary">
            Back to Applications
          </Button>
        </Col>
      </Row>
      
      {message && <Alert variant="success">{message}</Alert>}
      
      {/* Application Overview */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Application Overview</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Job Details</h5>
              <p><strong>Position:</strong> {application.job.jobTitle}</p>
              <p><strong>Company:</strong> {application.job.companyName}</p>
              <p><strong>Location:</strong> {application.job.location}</p>
              <p><strong>Salary:</strong> ${application.job.salary?.toLocaleString()}</p>
              <p>
                <strong>Status:</strong>{' '}
                <Badge bg={getStatusBadgeVariant(application.status)}>
                  {formatStatus(application.status)}
                </Badge>
              </p>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Applicant Details</h5>
              <p><strong>Name:</strong> {application.student.name}</p>
              <p><strong>Email:</strong> {application.student.email}</p>
              <p><strong>Major:</strong> {application.student.major || 'Not specified'}</p>
              <p><strong>Graduation Year:</strong> {application.student.graduationYear || 'Not specified'}</p>
              <p><strong>Applied On:</strong> {formatDate(application.dateApplied)}</p>
              {application.lastUpdated && (
                <p><strong>Last Updated:</strong> {formatDate(application.lastUpdated)}</p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Application Documents */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Application Documents</h4>
        </Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <Row>
              <Col>
                <h5 className="mb-2">Resume</h5>
                <p className="mb-0 text-muted">
                  {application.resumeUrl ? (
                    <Button 
                      href={application.resumeUrl} 
                      target="_blank" 
                      variant="outline-primary"
                      size="sm"
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      View Resume
                    </Button>
                  ) : (
                    'No resume uploaded'
                  )}
                </p>
              </Col>
            </Row>
          </ListGroup.Item>
          <ListGroup.Item>
            <Row>
              <Col>
                <h5 className="mb-2">Cover Letter</h5>
                {application.coverLetter ? (
                  <div style={{ maxHeight: '200px', overflow: 'auto', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>
                      {application.coverLetter}
                    </p>
                  </div>
                ) : (
                  <p className="mb-0 text-muted">No cover letter provided</p>
                )}
              </Col>
            </Row>
          </ListGroup.Item>
        </ListGroup>
      </Card>
      
      {/* Update Application Status */}
      <Card>
        <Card.Header>
          <h4>Manage Application</h4>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Update Status</Form.Label>
              <Form.Select 
                value={selectedStatus} 
                onChange={e => setSelectedStatus(e.target.value)}
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Interview">Interview</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Feedback to Candidate</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Provide feedback to the candidate (optional)"
              />
              <Form.Text className="text-muted">
                This feedback will be visible to the candidate.
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                onClick={handleUpdateStatus}
                disabled={loading || selectedStatus === application.status && feedback === application.feedback}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  'Update Application'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ApplicationDetail; 