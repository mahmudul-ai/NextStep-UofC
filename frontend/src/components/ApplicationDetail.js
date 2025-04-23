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
  const [updating, setUpdating] = useState(false);

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
          // Format application data to handle both frontend and backend field formats
          const appData = response.data;
          
          const formattedApp = {
            applicationId: appData.ApplicationID || appData.applicationId,
            applicantUcid: appData.ApplicantUCID || appData.applicantUcid,
            jobId: appData.JobID || appData.jobId,
            employerId: appData.EmployerID || appData.employerId,
            status: appData.Status || appData.status,
            dateApplied: appData.DateApplied || appData.dateApplied,
            lastUpdated: appData.lastUpdated || null,
            feedback: appData.feedback || '',
            // Format the job data if it exists
            job: appData.job ? {
              jobId: appData.job.JobID || appData.job.jobId,
              jobTitle: appData.job.JobTitle || appData.job.jobTitle,
              companyName: appData.job.CompanyName || appData.job.companyName,
              location: appData.job.Location || appData.job.location,
              salary: appData.job.Salary || appData.job.salary,
              deadline: appData.job.Deadline || appData.job.deadline
            } : null,
            // Format the student data if it exists
            student: appData.student ? {
              ucid: appData.student.UCID || appData.student.ucid,
              name: appData.student.name || `${appData.student.FName || ''} ${appData.student.LName || ''}`.trim(),
              firstName: appData.student.FName || appData.student.firstName,
              lastName: appData.student.LName || appData.student.lastName,
              email: appData.student.Email || appData.student.email,
              major: appData.student.Major || appData.student.major,
              graduationYear: appData.student.GraduationYear || appData.student.graduationYear
            } : null
          };
          
          setApplication(formattedApp);
          setSelectedStatus(formattedApp.status);
          setFeedback(formattedApp.feedback || '');
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
      setUpdating(true);
      setError('');
      
      // Format data for the backend
      const updateData = {
        applicationId: application.applicationId,
        status: selectedStatus,
        feedback: feedback
      };
      
      // If using real backend API, may need to format differently
      const backendFormatData = {
        Status: selectedStatus,
        feedback: feedback
      };
      
      // Use the update application API
      await api.updateApplicationStatus(application.applicationId, selectedStatus, feedback);
      
      // Update local state
      setApplication({
        ...application,
        status: selectedStatus,
        feedback,
        lastUpdated: new Date().toISOString()
      });
      
      setMessage('Application status updated successfully');
      setUpdating(false);
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application status: ' + (err.response?.data?.message || 'Please try again.'));
      setUpdating(false);
    }
  };
  
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
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

  // Check if data is properly loaded
  const hasJobData = application.job && Object.keys(application.job).length > 0;
  const hasStudentData = application.student && Object.keys(application.student).length > 0;
  
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
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Application Overview */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Application Overview</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5 className="mb-3">Job Details</h5>
              {hasJobData ? (
                <>
                  <p><strong>Position:</strong> {application.job.jobTitle}</p>
                  <p><strong>Company:</strong> {application.job.companyName}</p>
                  <p><strong>Location:</strong> {application.job.location}</p>
                  <p><strong>Salary:</strong> {formatSalary(application.job.salary)}</p>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge bg={getStatusBadgeVariant(application.status)}>
                      {formatStatus(application.status)}
                    </Badge>
                  </p>
                </>
              ) : (
                <Alert variant="warning">Job details not available</Alert>
              )}
              <Button 
                as={Link} 
                to={`/jobs/${application.jobId}`} 
                variant="outline-primary" 
                size="sm"
                className="mt-2"
              >
                View Full Job Details
              </Button>
            </Col>
            <Col md={6}>
              <h5 className="mb-3">Applicant Details</h5>
              {hasStudentData ? (
                <>
                  <p><strong>Name:</strong> {application.student.name}</p>
                  <p><strong>Email:</strong> {application.student.email}</p>
                  <p><strong>UCID:</strong> {application.student.ucid}</p>
                  <p><strong>Major:</strong> {application.student.major || 'Not specified'}</p>
                  <p><strong>Graduation Year:</strong> {application.student.graduationYear || 'Not specified'}</p>
                  <p><strong>Applied On:</strong> {formatDate(application.dateApplied)}</p>
                  {application.lastUpdated && (
                    <p><strong>Last Updated:</strong> {formatDate(application.lastUpdated)}</p>
                  )}
                </>
              ) : (
                <Alert variant="warning">Applicant details not available</Alert>
              )}
            </Col>
          </Row>
          
          {/* Application Status and Cover Letter */}
          <Row className="mt-4">
            <Col md={12}>
              <Card className="bg-light">
                <Card.Body>
                  <h5>Cover Letter</h5>
                  <p className="mb-0">
                    {application.coverLetter || 'No cover letter provided.'}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Update Application Status */}
      <Card>
        <Card.Header>
          <h4>Update Application Status</h4>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Application Status</Form.Label>
                  <Form.Select 
                    value={selectedStatus} 
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Feedback/Notes {selectedStatus === 'Rejected' && <span className="text-danger">(Required for rejection)</span>}</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback or notes about this application..."
                    required={selectedStatus === 'Rejected'}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                onClick={handleUpdateStatus}
                disabled={updating || (selectedStatus === 'Rejected' && !feedback)}
              >
                {updating ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Updating...
                  </>
                ) : (
                  'Update Status'
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