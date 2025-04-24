import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Badge, Tabs, Tab, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ViewApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const ucid = localStorage.getItem('ucid');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    // Redirect if not logged in as a student
    if (!ucid || userRole !== 'student') {
      navigate('/login');
      return;
    }
    
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.getStudentApplications(ucid);
        
        if (response?.data) {
          // Format application data to handle backend field names
          const formattedApplications = response.data.map(app => {
            // Handle both backend and frontend field name formats
            return {
              applicationId: app.ApplicationID || app.applicationId,
              applicantUcid: app.ApplicantUCID || app.applicantUcid,
              jobId: app.JobID || app.jobId,
              employerId: app.EmployerID || app.employerId,
              status: app.Status || app.status,
              dateApplied: app.DateApplied || app.dateApplied,
              lastUpdated: app.lastUpdated || null,
              feedback: app.feedback || '',
              // Format the job data if it exists
              job: app.job ? {
                jobId: app.job.JobID || app.job.jobId,
                jobTitle: app.job.JobTitle || app.job.jobTitle,
                companyName: app.job.CompanyName || app.job.companyName,
                location: app.job.Location || app.job.location,
                salary: app.job.Salary || app.job.salary,
                deadline: app.job.Deadline || app.job.deadline
              } : null
            };
          });
          
          setApplications(formattedApplications);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplications();
  }, [ucid, userRole, navigate]);

  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
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
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };
  
  // Group applications by status for easier viewing
  const activeApplications = applications.filter(app => 
    !['rejected', 'accepted'].includes((app.status || '').toLowerCase())
  );
  
  const completedApplications = applications.filter(app => 
    ['rejected', 'accepted'].includes((app.status || '').toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading applications...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Applications</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs defaultActiveKey="active" id="application-tabs" className="mb-4">
        <Tab eventKey="active" title={`Active Applications (${activeApplications.length})`}>
          {activeApplications.length === 0 ? (
            <Alert variant="info">
              You don't have any active applications at the moment.
            </Alert>
          ) : (
            <ListGroup variant="flush">
              {activeApplications.map(application => (
                <ListGroup.Item key={application.applicationId} className="py-3">
                  <Row>
                    <Col md={9}>
                      <h5>{application.job.jobTitle}</h5>
                      <p className="mb-1 text-muted">
                        {application.job.companyName} • {application.job.location}
                      </p>
                      <div className="d-flex align-items-center mt-2">
                        <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                          {formatStatus(application.status)}
                        </Badge>
                        <small className="text-muted">
                          Applied on {formatDate(application.dateApplied)}
                        </small>
                        {application.lastUpdated && (
                          <small className="text-muted ms-2">
                            • Last updated: {formatDate(application.lastUpdated)}
                          </small>
                        )}
                      </div>
                      {application.feedback && (
                        <div className="mt-2">
                          <strong>Feedback:</strong>
                          <p className="mb-0 mt-1">{application.feedback}</p>
                        </div>
                      )}
                    </Col>
                    <Col md={3} className="d-flex align-items-center justify-content-end">
                      <Button 
                        as={Link} 
                        to={`/jobs/${application.jobId}`} 
                        variant="outline-primary"
                        size="sm"
                      >
                        View Job
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>
        <Tab eventKey="completed" title={`Completed Applications (${completedApplications.length})`}>
          {completedApplications.length === 0 ? (
            <Alert variant="info">
              You don't have any completed applications yet.
            </Alert>
          ) : (
            <ListGroup variant="flush">
              {completedApplications.map(application => (
                <ListGroup.Item key={application.applicationId} className="py-3">
                  <Row>
                    <Col md={9}>
                      <h5>{application.job.jobTitle}</h5>
                      <p className="mb-1 text-muted">
                        {application.job.companyName} • {application.job.location}
                      </p>
                      <div className="d-flex align-items-center mt-2">
                        <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                          {formatStatus(application.status)}
                        </Badge>
                        <small className="text-muted">
                          Applied on {formatDate(application.dateApplied)}
                        </small>
                      </div>
                      {application.feedback && (
                        <div className="mt-2">
                          <strong>Feedback:</strong>
                          <p className="mb-0 mt-1">{application.feedback}</p>
                        </div>
                      )}
                    </Col>
                    <Col md={3} className="d-flex align-items-center justify-content-end">
                      <Button 
                        as={Link} 
                        to={`/jobs/${application.jobId}`} 
                        variant="outline-primary"
                        size="sm"
                      >
                        View Job
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
}

export default ViewApplications;
