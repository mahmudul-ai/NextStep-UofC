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
  const employerId = localStorage.getItem('employerId');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    // Redirect if not logged in
    if (!ucid && !employerId) {
      navigate('/login');
      return;
    }
    
    const fetchApplications = async () => {
      try {
        setLoading(true);
        let response;
        
        // Fetch applications based on user role
        if (userRole === 'student') {
          response = await api.getStudentApplications(ucid);
        } else if (userRole === 'employer') {
          response = await api.getCompanyApplications(employerId);
        }
        
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
              } : null,
              // Format the student data if it exists
              student: app.student ? {
                ucid: app.student.UCID || app.student.ucid,
                name: app.student.name || `${app.student.FName || ''} ${app.student.LName || ''}`.trim(),
                firstName: app.student.FName || app.student.firstName,
                lastName: app.student.LName || app.student.lastName,
                email: app.student.Email || app.student.email,
                major: app.student.Major || app.student.major,
                graduationYear: app.student.GraduationYear || app.student.graduationYear
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
  }, [ucid, employerId, userRole, navigate]);

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
  
  // Student Application View
  const StudentApplicationView = () => {
    // Group applications by status for easier viewing
    const activeApplications = applications.filter(app => 
      !['rejected', 'accepted'].includes((app.status || '').toLowerCase())
    );
    
    const completedApplications = applications.filter(app => 
      ['rejected', 'accepted'].includes((app.status || '').toLowerCase())
    );
    
    return (
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
        <Tab eventKey="all" title={`All Applications (${applications.length})`}>
          {applications.length === 0 ? (
            <Alert variant="info">
              You haven't applied to any jobs yet.
            </Alert>
          ) : (
            <ListGroup variant="flush">
              {applications.map(application => (
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
      </Tabs>
    );
  };
  
  // Employer Application View
  const EmployerApplicationView = () => {
    // Group applications by job for easier management
    const jobsWithApplications = {};
    
    applications.forEach(app => {
      if (!jobsWithApplications[app.job.jobId]) {
        jobsWithApplications[app.job.jobId] = {
          job: app.job,
          applications: []
        };
      }
      jobsWithApplications[app.job.jobId].applications.push(app);
    });
    
    return (
      <div>
        <h4 className="mb-3">Applications by Job</h4>
        {Object.keys(jobsWithApplications).length === 0 ? (
          <Alert variant="info">
            You don't have any applications for your job postings yet.
          </Alert>
        ) : (
          Object.values(jobsWithApplications).map(jobData => (
            <Card key={jobData.job.jobId} className="mb-4">
              <Card.Header>
                <h5 className="mb-0">{jobData.job.jobTitle}</h5>
                <small className="text-muted">
                  {jobData.applications.length} application(s)
                </small>
              </Card.Header>
              <ListGroup variant="flush">
                {jobData.applications.map(application => (
                  <ListGroup.Item key={application.applicationId} className="py-3">
                    <Row>
                      <Col md={8}>
                        <h6>{application.student.name}</h6>
                        <p className="mb-1 text-muted small">
                          {application.student.email} • {application.student.major}
                        </p>
                        <div className="d-flex align-items-center mt-1">
                          <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                            {formatStatus(application.status)}
                          </Badge>
                          <small className="text-muted">
                            Applied on {formatDate(application.dateApplied)}
                          </small>
                        </div>
                      </Col>
                      <Col md={4} className="d-flex align-items-center justify-content-end">
                        <Button
                          as={Link}
                          to={`/applications/${application.applicationId}`}
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                        >
                          Review
                        </Button>
                        {application.status === 'Submitted' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleUpdateStatus(application.applicationId, 'Under Review')}
                          >
                            Mark as Reviewing
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          ))
        )}
      </div>
    );
  };
  
  // Function to update application status
  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      await api.updateApplicationStatus(applicationId, newStatus);
      
      // Update the application in local state
      setApplications(applications.map(app => {
        if (app.applicationId === applicationId) {
          return { ...app, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] };
        }
        return app;
      }));
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status.');
    }
  };

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
      <h2 className="mb-4">
        {userRole === 'student' ? 'My Applications' : 'Job Applications'}
      </h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {userRole === 'student' ? <StudentApplicationView /> : <EmployerApplicationView />}
    </Container>
  );
}

export default ViewApplications;
