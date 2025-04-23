import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

function ApplicationHistory() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const ucid = localStorage.getItem('ucid');
  const userRole = localStorage.getItem('userRole');
  
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'all' ? 'all' : tabParam === 'active' ? 'active' : 'active';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Check if user is authorized
  useEffect(() => {
    if (!ucid || userRole !== 'student') {
      navigate('/login');
    }
  }, [ucid, userRole, navigate]);
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.getStudentApplications(ucid);
        console.log('Raw applications data:', response.data);
        
        // Filter applications to ensure they belong to the current user
        const userApplications = response.data.filter(app => {
          const appUcid = app.ApplicantUCID || app.applicantUcid;
          return appUcid && (appUcid.toString() === ucid.toString() || parseInt(appUcid) === parseInt(ucid));
        });
        
        console.log('Filtered applications for current user:', userApplications);
        
        // For each application, fetch the associated job details if not already included
        const applicationsWithJobDetails = await Promise.all(
          userApplications.map(async (app) => {
            // If job details are already included, use them
            if (app.job) {
              return {
                applicationId: app.ApplicationID || app.applicationId || app.id,
                jobId: app.JobID || app.jobId,
                employerId: app.EmployerID || app.employerId,
                status: app.Status || app.status,
                dateApplied: app.DateApplied || app.dateApplied,
                feedback: app.Feedback || app.feedback || '',
                job: {
                  jobId: app.job.JobID || app.job.jobId,
                  jobTitle: app.job.JobTitle || app.job.jobTitle,
                  companyName: app.job.CompanyName || app.job.companyName,
                  location: app.job.Location || app.job.location,
                  salary: app.job.Salary || app.job.salary,
                  deadline: app.job.Deadline || app.job.deadline,
                  description: app.job.Description || app.job.description
                }
              };
            }
            
            // Otherwise, fetch the job details
            try {
              const jobId = app.JobID || app.jobId;
              if (!jobId) {
                console.warn('Application missing job ID:', app);
                return {
                  applicationId: app.ApplicationID || app.applicationId || app.id,
                  jobId: null,
                  employerId: app.EmployerID || app.employerId,
                  status: app.Status || app.status,
                  dateApplied: app.DateApplied || app.dateApplied,
                  feedback: app.Feedback || app.feedback || '',
                  job: null
                };
              }
              
              const jobResponse = await api.getJob(jobId);
              const jobData = jobResponse.data;
              
              // If company name is missing but we have employerId, fetch the employer details
              let companyName = jobData.CompanyName || jobData.companyName;
              if (!companyName && (jobData.Employer || jobData.employerId)) {
                try {
                  const employerId = jobData.Employer || jobData.employerId;
                  const employerResponse = await api.getEmployer(employerId);
                  companyName = employerResponse.data.CompanyName || employerResponse.data.companyName;
                  console.log(`Found company name '${companyName}' for job ${jobId} from employer ${employerId}`);
                } catch (employerError) {
                  console.error(`Error fetching employer details for job ${jobId}:`, employerError);
                }
              }
              
              return {
                applicationId: app.ApplicationID || app.applicationId || app.id,
                jobId: jobId,
                employerId: app.EmployerID || app.employerId,
                status: app.Status || app.status,
                dateApplied: app.DateApplied || app.dateApplied,
                feedback: app.Feedback || app.feedback || '',
                job: {
                  jobId: jobData.JobID || jobData.jobId,
                  jobTitle: jobData.JobTitle || jobData.jobTitle,
                  companyName: companyName || 'Company Name Not Available',
                  location: jobData.Location || jobData.location,
                  salary: jobData.Salary || jobData.salary,
                  deadline: jobData.Deadline || jobData.deadline,
                  description: jobData.Description || jobData.description
                }
              };
            } catch (error) {
              console.error(`Error fetching job details for application ${app.ApplicationID || app.applicationId}:`, error);
              return {
                applicationId: app.ApplicationID || app.applicationId || app.id,
                jobId: app.JobID || app.jobId,
                employerId: app.EmployerID || app.employerId,
                status: app.Status || app.status,
                dateApplied: app.DateApplied || app.dateApplied,
                feedback: app.Feedback || app.feedback || '',
                job: null
              };
            }
          })
        );
        
        console.log('Applications with job details:', applicationsWithJobDetails);
        
        // Sort applications by date applied (newest first)
        const sortedApplications = applicationsWithJobDetails.sort((a, b) => 
          new Date(b.dateApplied) - new Date(a.dateApplied)
        );
        
        setApplications(sortedApplications);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError("Failed to load applications. Please try again later.");
        setLoading(false);
      }
    };
    
    if (ucid) {
      fetchApplications();
    }
  }, [ucid]);
  
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    if (!status) return 'secondary';
    
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
    if (!status) return 'Unknown';
    
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
  
  // Filter applications by status
  const activeApplications = applications.filter(app => 
    app.status && !['rejected', 'accepted'].includes(app.status.toLowerCase())
  );
  
  const completedApplications = applications.filter(app => 
    app.status && ['rejected', 'accepted'].includes(app.status.toLowerCase())
  );
  
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
          <h2>Application History</h2>
          <p className="text-muted">Track all your job applications</p>
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
      {applications.length === 0 && !loading && (
        <Alert variant="info">
          You haven't submitted any job applications yet. Browse jobs to find opportunities.
          <div className="mt-3">
            <Button as={Link} to="/browse" variant="primary">Browse Jobs</Button>
          </div>
        </Alert>
      )}
      
      {/* Applications list */}
      {applications.length > 0 && (
        <Tabs 
          activeKey={activeTab} 
          onSelect={(k) => setActiveTab(k)} 
          id="application-tabs" 
          className="mb-3"
        >
          <Tab eventKey="active" title={`Active Applications (${activeApplications.length})`}>
            {activeApplications.length === 0 ? (
              <Alert variant="info">You don't have any active applications at the moment.</Alert>
            ) : (
              <Card>
                <ListGroup variant="flush">
                  {activeApplications.map((application) => (
                    <ListGroup.Item key={application.applicationId}>
                      <Row>
                        <Col md={8}>
                          <h5 className="mb-1">{application.job?.jobTitle || 'Unnamed Job'}</h5>
                          <p className="mb-1 text-muted">{application.job?.companyName || 'Unknown Company'} • {application.job?.location || 'No location specified'}</p>
                          <div>
                            <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                              {formatStatus(application.status)}
                            </Badge>
                            <small className="text-muted">Applied on: {formatDate(application.dateApplied)}</small>
                          </div>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end align-items-center">
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
              </Card>
            )}
          </Tab>
          
          <Tab eventKey="completed" title={`Completed Applications (${completedApplications.length})`}>
            {completedApplications.length === 0 ? (
              <Alert variant="info">You don't have any completed applications yet.</Alert>
            ) : (
              <Card>
                <ListGroup variant="flush">
                  {completedApplications.map((application) => (
                    <ListGroup.Item key={application.applicationId}>
                      <Row>
                        <Col md={8}>
                          <h5 className="mb-1">{application.job?.jobTitle || 'Unnamed Job'}</h5>
                          <p className="mb-1 text-muted">{application.job?.companyName || 'Unknown Company'} • {application.job?.location || 'No location specified'}</p>
                          <div>
                            <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                              {formatStatus(application.status)}
                            </Badge>
                            <small className="text-muted">Applied on: {formatDate(application.dateApplied)}</small>
                            {application.feedback && (
                              <p className="mt-2 mb-0">
                                <strong>Feedback:</strong> {application.feedback}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end align-items-center">
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
              </Card>
            )}
          </Tab>
          
          <Tab eventKey="all" title={`All Applications (${applications.length})`}>
            {applications.length === 0 ? (
              <Alert variant="info">You don't have any applications yet.</Alert>
            ) : (
              <Card>
                <ListGroup variant="flush">
                  {applications.map((application) => (
                    <ListGroup.Item key={application.applicationId}>
                      <Row>
                        <Col md={8}>
                          <h5 className="mb-1">{application.job?.jobTitle || 'Unnamed Job'}</h5>
                          <p className="mb-1 text-muted">{application.job?.companyName || 'Unknown Company'} • {application.job?.location || 'No location specified'}</p>
                          <div>
                            <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                              {formatStatus(application.status)}
                            </Badge>
                            <small className="text-muted">Applied on: {formatDate(application.dateApplied)}</small>
                            {application.feedback && (
                              <p className="mt-2 mb-0">
                                <strong>Feedback:</strong> {application.feedback}
                              </p>
                            )}
                          </div>
                        </Col>
                        <Col md={4} className="d-flex justify-content-end align-items-center">
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
              </Card>
            )}
          </Tab>
        </Tabs>
      )}
    </Container>
  );
}

export default ApplicationHistory; 