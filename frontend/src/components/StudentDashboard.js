import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Tab, Tabs, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communityScore, setCommunityScore] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [moderatorId, setModeratorId] = useState(null);
  
  // Additional state for moderator functionality
  const [studentVerifications, setStudentVerifications] = useState([]);
  const [employerVerifications, setEmployerVerifications] = useState([]);
  const [moderatorActiveTab, setModeratorActiveTab] = useState('students');
  const [loadingModeratorData, setLoadingModeratorData] = useState(false);
  
  const navigate = useNavigate();
  const ucid = localStorage.getItem('ucid');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!ucid || userRole !== 'student') {
      navigate('/login');
    } else {
      refreshUserStatus();
    }
  }, [ucid, userRole, navigate]);
  
  // Function to refresh user status (verification and moderator status)
  const refreshUserStatus = async () => {
    try {
      // Check verification status
      const verificationResponse = await api.checkVerificationStatus('student', ucid);
      console.log('Student verification status:', verificationResponse.data);
      setVerificationStatus(verificationResponse.data.status);
      setVerificationFeedback(verificationResponse.data.feedback);
      
      // Check if user is a moderator
      const moderatorResponse = await api.checkModeratorStatus(ucid);
      console.log('Moderator status check response:', moderatorResponse.data);
      setIsModerator(moderatorResponse.data.isModerator);
      setModeratorId(moderatorResponse.data.moderatorId);
      
      // Update localStorage with moderator ID if found
      if (moderatorResponse.data.isModerator && moderatorResponse.data.moderatorId) {
        const modId = moderatorResponse.data.moderatorId;
        localStorage.setItem('moderatorId', modId);
        console.log(`Set moderatorId in localStorage: ${modId}`);
      } else if (moderatorResponse.data.isModerator) {
        console.warn('User is a moderator but no moderatorId was returned from the API');
      }
      } catch (err) {
      console.error("Error checking user status:", err);
      }
    };
  
  // Fetch saved jobs and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch applications
        const applicationsResponse = await api.getStudentApplications(ucid);
        console.log('Raw applications data:', applicationsResponse.data);
        
        // Filter applications to ensure they belong to the current user
        const userApplications = applicationsResponse.data.filter(app => {
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
            applicationId: app.ApplicationID || app.applicationId,
            status: app.Status || app.status,
            dateApplied: app.DateApplied || app.dateApplied,
            jobId: app.JobID || app.jobId,
                job: {
              jobId: app.job.JobID || app.job.jobId,
              jobTitle: app.job.JobTitle || app.job.jobTitle,
              companyName: app.job.CompanyName || app.job.companyName,
              location: app.job.Location || app.job.location,
              salary: app.job.Salary || app.job.salary,
              deadline: app.job.Deadline || app.job.deadline
                }
              };
            }
            
            // Otherwise, fetch the job details
            try {
              const jobId = app.JobID || app.jobId;
              if (!jobId) {
                console.warn('Application missing job ID:', app);
                return {
                  applicationId: app.ApplicationID || app.applicationId,
                  status: app.Status || app.status,
                  dateApplied: app.DateApplied || app.dateApplied,
                  jobId: null,
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
                applicationId: app.ApplicationID || app.applicationId,
                status: app.Status || app.status,
                dateApplied: app.DateApplied || app.dateApplied,
                jobId: jobId,
                job: {
                  jobId: jobData.JobID || jobData.jobId,
                  jobTitle: jobData.JobTitle || jobData.jobTitle,
                  companyName: companyName || 'Company Name Not Available',
                  location: jobData.Location || jobData.location,
                  salary: jobData.Salary || jobData.salary,
                  deadline: jobData.Deadline || jobData.deadline
                }
              };
            } catch (error) {
              console.error(`Error fetching job details for application ${app.ApplicationID || app.applicationId}:`, error);
              return {
                applicationId: app.ApplicationID || app.applicationId,
                status: app.Status || app.status,
                dateApplied: app.DateApplied || app.dateApplied,
                jobId: app.JobID || app.jobId,
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
        
        // Fetch user post stats for community score
        const communityScoreResponse = await api.getUserPostStats(ucid);
        console.log('User post stats for dashboard:', communityScoreResponse.data);
        
        // Set community score equal to post count
        const userPostCount = communityScoreResponse.data.postCount || 0;
        console.log(`Setting post count for user ${ucid} to ${userPostCount}`);
        setCommunityScore(userPostCount);
        setPostCount(userPostCount);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };
    
    if (ucid) {
      fetchData();
    }
  }, [ucid]);
  
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
  
  // Get deadline badge variant
  const getDeadlineBadgeVariant = (daysRemaining) => {
    if (daysRemaining <= 0) return 'danger';
    if (daysRemaining <= 3) return 'warning';
    if (daysRemaining <= 7) return 'info';
    return 'success';
  };
  
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
  
  // Format date display - Update to use direct string manipulation
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      // Use direct string manipulation to avoid timezone issues
      // Expected format: YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length !== 3) {
        return dateString; // Return original if not in expected format
      }
      
      const year = parts[0];
      const month = parseInt(parts[1]);
      const day = parseInt(parts[2]);
      
      // Map month number to name
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[month - 1]; // -1 because array is 0-indexed
      
      return `${monthName} ${day}, ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return dateString;
    }
  };
  
  // Filter active applications
  const activeApplications = applications.filter(app => 
    app.status && !['rejected', 'accepted'].includes(app.status.toLowerCase())
  ).slice(0, 3); // Only show the first 3 active applications
  
  // Check if student is verified
  const isVerified = verificationStatus === 'Verified' || verificationStatus === 'verified' || isModerator;
  const isPending = !isVerified && (verificationStatus === 'Pending' || verificationStatus === 'pending');
  const isRejected = !isVerified && (verificationStatus === 'Rejected' || verificationStatus === 'rejected');
  
  // Handle rejecting a verification with feedback
  const handleRejectVerification = async (type, id) => {
    const feedback = prompt('Please provide a reason for rejecting this verification request:');
    if (feedback === null) return; // User canceled
    
    try {
      if (type === 'student') {
        await api.updateStudentVerification(id, 'Rejected', feedback);
        setStudentVerifications(prevVerifications => 
          prevVerifications.filter(v => v.applicantUcid !== id)
        );
      } else if (type === 'employer') {
        await api.updateEmployerVerification(id, 'Rejected', feedback);
        setEmployerVerifications(prevVerifications => 
          prevVerifications.filter(v => v.employerId !== id)
        );
      }
      
      alert(`${type === 'student' ? 'Student' : 'Employer'} verification request has been rejected and feedback has been sent.`);
    } catch (err) {
      console.error(`Error rejecting ${type} verification:`, err);
      alert(`Failed to reject ${type} verification. Please try again.`);
    }
  };
  
  // Handle approving a verification
  const handleApproveVerification = async (type, id) => {
    try {
      const moderatorId = localStorage.getItem('moderatorId');
      
      if (!moderatorId) {
        alert("Unable to verify: Your moderator ID is missing. Please log out and log back in.");
        return;
      }
      
      console.log(`Approving ${type} with ID ${id} by moderator ${moderatorId}`);
      
      // Use the updateVerificationStatus method
      const response = await api.updateVerificationStatus(type, id, 'Approved');
      console.log(`Approval response:`, response.data);
      
      // Update local state - remove from pending queue since it's now approved
      if (type === 'student') {
        setStudentVerifications(prevVerifications => 
          prevVerifications.filter(v => v.applicantUcid !== id)
        );
      } else if (type === 'employer') {
        setEmployerVerifications(prevVerifications => 
          prevVerifications.filter(v => v.employerId !== id)
        );
      }
      
      alert(`${type === 'student' ? 'Student' : 'Employer'} account has been verified successfully.`);
    } catch (err) {
      console.error("Error approving verification:", err);
      console.error("Error details:", err.response?.data || "No detailed error information available");
      
      let errorMessage = "Failed to approve verification. ";
      if (err.response?.status === 400) {
        errorMessage += "There was an issue with the data format: ";
        // Try to get specific error details from the response
        if (typeof err.response.data === 'string') {
          errorMessage += err.response.data;
        } else if (typeof err.response.data === 'object') {
          const errorDetails = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          errorMessage += errorDetails || JSON.stringify(err.response.data);
        }
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage += "You may not have permission to perform this action.";
      } else if (err.response?.status === 404) {
        errorMessage += "The verification record could not be found.";
      } else if (err.response?.status >= 500) {
        errorMessage += "There was a server error. Please try again later.";
      } else {
        errorMessage += "Please try again.";
      }
      
      alert(errorMessage);
    }
  };
  
  // Fetch moderator data
  useEffect(() => {
    const fetchModeratorData = async () => {
      if (!isModerator || !moderatorId) return;
      
      try {
        setLoadingModeratorData(true);
        
        // Fetch pending student verifications
        const studentVerificationsResponse = await api.getStudentVerificationQueue();
        // Filter only pending verifications
        const pendingStudentVerifications = studentVerificationsResponse.data.filter(
          v => v.VerificationStatus === 'Pending'
        );
        
        // Get student details for each verification
        const studentDataPromises = pendingStudentVerifications.map(async (verification) => {
          try {
            const ucid = parseInt(verification.ApplicantUCID);
            const studentResponse = await api.getStudentProfile(ucid);
            return {
              vid: verification.VID,
              applicantUcid: ucid,
              status: verification.VerificationStatus,
              date: verification.VerificationDate,
              student: {
                ucid: studentResponse.data.UCID,
                name: `${studentResponse.data.FName || ''} ${studentResponse.data.LName || ''}`.trim(),
                email: studentResponse.data.Email,
                major: studentResponse.data.Major,
                graduationYear: studentResponse.data.GraduationYear
              }
            };
          } catch (err) {
            console.error(`Error fetching details for student ${verification.ApplicantUCID}:`, err);
            return null;
          }
        });
        
        const studentData = (await Promise.all(studentDataPromises)).filter(Boolean);
        setStudentVerifications(studentData);
        
        // Fetch pending employer verifications
        const employerVerificationsResponse = await api.getEmployerVerificationQueue();
        // Filter only pending verifications
        const pendingEmployerVerifications = employerVerificationsResponse.data.filter(
          v => v.VerificationStatus === 'Pending'
        );
        
        // Get employer details for each verification
        const employerDataPromises = pendingEmployerVerifications.map(async (verification) => {
          try {
            const employerId = parseInt(verification.EmployerID);
            const employerResponse = await api.getEmployer(employerId);
            return {
              vid: verification.VID,
              employerId: employerId,
              status: verification.VerificationStatus,
              date: verification.VerificationDate,
              employer: {
                employerId: employerResponse.data.EmployerID,
                companyName: employerResponse.data.CompanyName,
                email: employerResponse.data.Email,
                industry: employerResponse.data.Industry || 'Not specified'
              }
            };
          } catch (err) {
            console.error(`Error fetching details for employer ${verification.EmployerID}:`, err);
            return null;
          }
        });
        
        const employerData = (await Promise.all(employerDataPromises)).filter(Boolean);
        setEmployerVerifications(employerData);
        
        setLoadingModeratorData(false);
      } catch (err) {
        console.error("Error fetching moderator data:", err);
        setLoadingModeratorData(false);
      }
    };
    
    fetchModeratorData();
  }, [isModerator, moderatorId]);
  
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Verification Status Alert */}
      {verificationStatus === 'Pending' && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
            <div>
          <Alert.Heading>Account Verification Pending</Alert.Heading>
              <p className="mb-0">
                Your account is awaiting verification by a moderator. Some features may be limited until your account is verified.
          </p>
            </div>
          </div>
        </Alert>
      )}
      
      {verificationStatus === 'Rejected' && (
        <Alert variant="danger" className="mb-4">
          <div className="d-flex align-items-center">
            <i className="bi bi-x-circle-fill me-2 fs-4"></i>
            <div>
          <Alert.Heading>Account Verification Rejected</Alert.Heading>
              <p className="mb-0">
                Your account verification was rejected. Reason: {verificationFeedback || 'No reason provided.'}
                Please update your profile information and contact support for assistance.
              </p>
            </div>
          </div>
        </Alert>
      )}
      
      {/* Main Dashboard */}
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4">Student Dashboard</h2>
        </Col>
        <Col xs="auto">
          <div className="d-flex">
            <Button 
              as={Link} 
              to="/browse" 
              variant="primary" 
              className="me-2">
            Browse Jobs
          </Button>
            <Button 
              as={Link} 
              to="/application-history" 
              variant="outline-primary">
              My Applications
          </Button>
          </div>
        </Col>
      </Row>
      
      {/* Overview Cards */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="mb-4 mb-lg-0">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Job Application Summary</h5>
              <Button as={Link} to="/application-history" variant="link" size="sm">View History</Button>
            </Card.Header>
            <Card.Body>
              <Row>
                {[
                  { status: 'Submitted', variant: 'warning' },
                  { status: 'Under Review', variant: 'info' },
                  { status: 'Interview', variant: 'primary' },
                  { status: 'Offer', variant: 'success' }
                ].map(({ status, variant }) => {
                  const count = applications.filter(app => 
                    app.status?.toLowerCase() === status.toLowerCase()
                  ).length;
                  
                  return (
                    <Col xs={6} md={3} key={status} className="text-center mb-3">
                      <div className="p-3">
                        <h3 className="mb-2">{count}</h3>
                        <Badge 
                          bg={variant}
                          style={{ width: '100%', display: 'block', padding: '8px' }}
                        >
                          {status}
                        </Badge>
                </div>
        </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Community Engagement</h5>
              <Button as={Link} to="/forum" variant="link" size="sm">Visit Forum</Button>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="display-4">{postCount}</h1>
              <Card.Title className="d-flex align-items-center justify-content-center">
                <i className="bi bi-chat-square-text text-success me-2"></i>
                Posts Created
              </Card.Title>
              <p className="text-muted small">
                Your contribution to the community forum
              </p>
              <Button as={Link} to="/forum?tab=my-posts" variant="outline-success" className="mt-2">
                <i className="bi bi-list-ul me-2"></i>
                View My Posts
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Jobs and Applications */}
      <Row className="mb-4">
        <Col>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Applications</h5>
              <Button as={Link} to="/application-history" variant="link" size="sm">View All</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {applications.length > 0 ? (
                applications.slice(0, 5).map((application) => ( // Show up to 5 applications since we have more space now
                  <ListGroup.Item key={application.applicationId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{application.job?.jobTitle}</h6>
                        <small className="d-block">{application.job?.companyName}</small>
                        <div>
                          <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                            {formatStatus(application.status)}
                          </Badge>
                          <small className="text-muted">
                            Applied: {formatDate(application.dateApplied)}
                          </small>
                        </div>
                      </div>
                      <Button 
                        as={Link} 
                        to={`/jobs/${application.jobId}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        View Job
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <div className="p-0">
                  <div className="text-center py-5 px-3" style={{ backgroundColor: 'rgba(13, 110, 253, 0.03)' }}>
                    <div className="mb-3">
                      <span className="d-inline-block p-3 bg-light rounded-circle shadow-sm">
                        <i className="bi bi-clipboard2-check text-primary" style={{ fontSize: '2.5rem' }}></i>
                      </span>
                    </div>
                    <h5 className="mb-2">No Applications Yet</h5>
                    <p className="text-muted mb-4 px-4">
                      Apply to jobs to track your application progress
                    </p>
                    <Button as={Link} to="/browse" variant="primary" className="mt-2">
                      <i className="bi bi-send me-2"></i>
                      Apply Now
                    </Button>
                  </div>
                </div>
              )}
            </ListGroup>
            <Card.Footer className="text-center" style={{ borderTop: applications.length > 0 ? '' : 'none' }}>
              {applications.length > 0 && (
                <Button as={Link} to="/browse" variant="outline-primary">
                  <i className="bi bi-send me-2"></i>
                  Apply for More Jobs
                </Button>
              )}
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      {/* Moderator Section - Keep existing styling with some updates for consistency */}
      {isModerator && (
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
                <h5 className="mb-0">Moderator Controls</h5>
            </Card.Header>
            <Card.Body>
                {loadingModeratorData ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading moderator data...</span>
                    </Spinner>
                </div>
                ) : (
                  <>
                    <Tabs
                      activeKey={moderatorActiveTab}
                      onSelect={(key) => setModeratorActiveTab(key)}
                      className="mb-3"
                    >
                      <Tab eventKey="students" title={`Student Verifications (${studentVerifications.length})`}>
                        {studentVerifications.length === 0 ? (
                          <Alert variant="info">No pending student verifications.</Alert>
                        ) : (
                <ListGroup variant="flush">
                            {studentVerifications.map(verification => (
                              <ListGroup.Item key={verification.applicantUcid}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h5 className="mb-1">{verification.student.name}</h5>
                                    <p className="mb-1">
                                      <strong>UCID:</strong> {verification.student.ucid}<br />
                                      <strong>Email:</strong> {verification.student.email}<br />
                                      <strong>Major:</strong> {verification.student.major || 'Not specified'}<br />
                                      <strong>Graduation Year:</strong> {verification.student.graduationYear || 'Not specified'}
                                    </p>
                                  </div>
                      <div className="d-flex">
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleApproveVerification('student', verification.applicantUcid)}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleRejectVerification('student', verification.applicantUcid)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                      </Tab>
                      
                      <Tab eventKey="employers" title={`Employer Verifications (${employerVerifications.length})`}>
                        {employerVerifications.length === 0 ? (
                          <Alert variant="info">No pending employer verifications.</Alert>
                        ) : (
                          <ListGroup variant="flush">
                            {employerVerifications.map(verification => (
                              <ListGroup.Item key={verification.employerId}>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h5 className="mb-1">{verification.employer.companyName}</h5>
                                    <p className="mb-1">
                                      <strong>Email:</strong> {verification.employer.email}<br />
                                      <strong>Industry:</strong> {verification.employer.industry || 'Not specified'}
                                    </p>
                                  </div>
                                  <div className="d-flex">
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      className="me-2"
                                      onClick={() => handleApproveVerification('employer', verification.employerId)}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => handleRejectVerification('employer', verification.employerId)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        )}
                      </Tab>
                    </Tabs>
                  </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      )}
    </Container>
  );
}

export default StudentDashboard; 