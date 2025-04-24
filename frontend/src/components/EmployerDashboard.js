import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function EmployerDashboard() {
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');

  const navigate = useNavigate();
  const employerId = parseInt(localStorage.getItem('employerId'));
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!employerId || userRole !== 'employer') {
      navigate('/login');
    }
  }, [employerId, userRole, navigate]);

  // Check verification status
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await api.checkVerificationStatus('employer', employerId);
        setVerificationStatus(response.data.status);
        setVerificationFeedback(response.data.feedback);
      } catch (err) {
        console.error("Error checking verification status:", err);
      }
    };
    
    if (employerId) {
      checkVerification();
    }
  }, [employerId]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch employer data directly
        let employerData = { employerId, companyName: "Your Company" };
        
        try {
          const employerResponse = await api.getEmployer(employerId);
          if (employerResponse.data) {
            employerData = {
              employerId: employerResponse.data.EmployerID || employerId,
              companyName: employerResponse.data.CompanyName || "Your Company",
              industry: employerResponse.data.Industry || "",
              website: employerResponse.data.Website || "",
              description: employerResponse.data.Description || ""
            };
          }
        } catch (err) {
          console.log("Could not fetch employer data directly, using fallback");
        }
        
        setEmployer(employerData);

        // Fetch employer's job postings
        const jobsResponse = await api.getJobs({ employerId });
        
        // Map backend field names to frontend field names with improved validation
        const formattedJobs = jobsResponse.data.map(job => {
          // Debug logging to catch issues with job data
          console.log('Processing job data:', {
            jobId: job.JobID || job.jobId,
            salary: job.Salary || job.salary,
            deadline: job.Deadline || job.deadline
          });
          
          // Parse salary safely to avoid NaN
          const rawSalary = job.Salary || job.salary;
          let parsedSalary = 0;
          
          if (rawSalary !== undefined && rawSalary !== null) {
            // Try to parse the salary, default to 0 if it fails
            parsedSalary = typeof rawSalary === 'string' ? 
              parseFloat(rawSalary.replace(/[^0-9.]/g, '')) : 
              parseFloat(rawSalary);
            
            // Set to 0 if parsing resulted in NaN
            if (isNaN(parsedSalary)) {
              console.warn(`Invalid salary value for job ${job.JobID || job.jobId}:`, rawSalary);
              parsedSalary = 0;
            }
          }
          
          // Validate deadline
          const rawDeadline = job.Deadline || job.deadline;
          let validDeadline = null;
          
          if (rawDeadline) {
            try {
              // Check if it's a valid date
              const testDate = new Date(rawDeadline);
              validDeadline = isNaN(testDate.getTime()) ? null : rawDeadline;
            } catch (e) {
              console.warn(`Invalid deadline value for job ${job.JobID || job.jobId}:`, rawDeadline);
            }
          }
          
          return {
            jobId: job.JobID || job.jobId,
            employerId: job.Employer || job.employerId,
            jobTitle: job.JobTitle || job.jobTitle,
            companyName: job.CompanyName || employerData.companyName,
            location: job.Location || job.location,
            salary: parsedSalary,
            deadline: validDeadline,
            description: job.Description || job.description,
            status: job.Status || job.status || "Active"
          };
        });
        
        setJobs(formattedJobs);

        // Fetch applications for employer's jobs
        const applicationsResponse = await api.getApplications({ employerId });
        
        // Map backend field names to frontend field names
        const formattedApplications = applicationsResponse.data.map(app => {
          return {
            applicationId: app.ApplicationID || app.applicationId,
            applicantUcid: app.ApplicantUCID || app.applicantUcid,
            jobId: app.JobID || app.jobId,
            status: app.Status || app.status,
            dateApplied: app.DateApplied || app.dateApplied,
            student: app.student || null,
            job: app.job ? {
              jobId: app.job.JobID || app.job.jobId,
              jobTitle: app.job.JobTitle || app.job.jobTitle,
              companyName: app.job.CompanyName || employerData.companyName
            } : null
          };
        });
        
        setApplications(formattedApplications);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [employerId]);

  // Group applications by job
  const getApplicationCountByJob = () => {
    const counts = {};
    applications.forEach(app => {
      counts[app.jobId] = (counts[app.jobId] || 0) + 1;
    });
    return counts;
  };

  const applicationCounts = getApplicationCountByJob();

  // Count applications by status
  const getApplicationCountByStatus = () => {
    const counts = {
      'Submitted': 0,
      'Under Review': 0,
      'Interview Scheduled': 0,
      'Offer Extended': 0,
      'Rejected': 0
    };
    
    applications.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });
    
    return counts;
  };

  const applicationStatusCounts = getApplicationCountByStatus();
  
  // Function to get status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Verified':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Format date with fallback
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    
    try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return 'No deadline';
      }
      
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'No deadline';
    }
  };

  // Format salary to avoid NaN
  const formatSalary = (salary) => {
    if (salary === undefined || salary === null || isNaN(salary)) {
      return '$0';
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(salary);
    } catch (error) {
      console.error('Error formatting salary:', error, salary);
      return '$0';
    }
  };

  // Check if employer is verified
  const isVerified = verificationStatus === 'Verified';
  const isPending = verificationStatus === 'Pending';
  const isRejected = verificationStatus === 'Rejected';

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
      {/* Verification Status Alerts */}
      {isPending && (
        <Alert variant="warning" className="mb-3">
          <Alert.Heading>Account Verification Pending</Alert.Heading>
          <p>
            Your company account is awaiting verification by a moderator. Once verified, you'll be able to post jobs.
            You can still browse the platform and participate in the community forum.
          </p>
        </Alert>
      )}
      
      {isRejected && (
        <Alert variant="danger" className="mb-3">
          <Alert.Heading>Account Verification Rejected</Alert.Heading>
          <p>
            Your company verification was not approved. Please update your profile according to the feedback below:
          </p>
          <p className="mb-0"><strong>Feedback:</strong> {verificationFeedback}</p>
          <div className="d-flex justify-content-end mt-2">
            <Button as={Link} to="/company-profile" variant="outline-danger">
              Update Company Profile
            </Button>
          </div>
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">Employer Dashboard</h1>
          <p className="text-muted">Welcome back! Here's an overview of your job postings and applications.</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/create-job" variant="primary" className="me-2" disabled={!isVerified}>
            Post New Job
          </Button>
          <Button as={Link} to="/forum" variant="outline-primary">
            Community Forum
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Company Overview Card */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h3>{employer?.companyName || 'Your Company'}</h3>
                  <div className="d-flex align-items-center">
                    <Badge 
                      bg={getStatusBadgeVariant(verificationStatus || 'Pending')} 
                      className="me-2"
                    >
                      {verificationStatus || 'Pending Verification'}
                    </Badge>
                    {!isVerified && (
                      <span className="text-muted ms-2">
                        Verification required to post jobs
                      </span>
                    )}
                  </div>
                </Col>
                <Col md={4} className="text-end">
                  <div className="d-grid">
                    <Button as={Link} to="/create-job" variant="primary" className="mb-2" disabled={!isVerified}>
                      Post New Job
                      {!isVerified && <span className="ms-2">(Verification Required)</span>}
                    </Button>
                    <Button as={Link} to="/manage-jobs" variant="outline-primary" disabled={!isVerified && jobs.length === 0}>
                      Manage Jobs
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Active Job Postings</h5>
              <Button as={Link} to="/manage-jobs" variant="link" size="sm">Manage Jobs</Button>
            </Card.Header>
            {jobs.filter(job => job.status === 'Active').length === 0 ? (
              <Card.Body>
                <Alert variant="info">
                  You don't have any active job postings. Create a new job posting to start receiving applications.
                  </Alert>
                <div className="text-center mt-3">
                  <Button as={Link} to="/create-job" variant="primary">Post a New Job</Button>
                </div>
              </Card.Body>
            ) : (
              <>
                <ListGroup variant="flush">
                  {jobs.filter(job => job.status === 'Active').slice(0, 3).map(job => (
                    <ListGroup.Item key={job.jobId}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{job.jobTitle}</h6>
                          <div className="d-flex align-items-center mb-1">
                            <Badge bg="secondary" className="me-2">{job.location}</Badge>
                            <small className="text-muted">{formatSalary(job.salary)}</small>
                          </div>
                          <small className="text-muted d-flex align-items-center">
                            <i className="bi bi-calendar-event me-1"></i>
                            Deadline: {formatDate(job.deadline)}
                            
                            {/* Show number of applications if any */}
                            {getApplicationCountByJob()[job.jobId] > 0 && (
                              <span className="ms-3 text-primary">
                                <i className="bi bi-person-fill me-1"></i>
                                {getApplicationCountByJob()[job.jobId]} applicant{getApplicationCountByJob()[job.jobId] !== 1 ? 's' : ''}
                              </span>
                            )}
                          </small>
                        </div>
                        <div>
                          <Button as={Link} to={`/jobs/${job.jobId}`} variant="outline-primary" size="sm" className="me-2">
                            View
                          </Button>
                          <Button as={Link} to={`/jobs/${job.jobId}/edit`} variant="outline-secondary" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                {jobs.filter(job => job.status === 'Active').length > 3 && (
            <Card.Footer className="text-center">
                    <Button as={Link} to="/manage-jobs" variant="outline-primary">
                      View All {jobs.filter(job => job.status === 'Active').length} Jobs
              </Button>
            </Card.Footer>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>
      
    </Container>
  );
}

export default EmployerDashboard; 