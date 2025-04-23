import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Tab, Tabs, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function StudentDashboard() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forumPosts, setForumPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [communityScore, setCommunityScore] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [moderatorId, setModeratorId] = useState(null);
  
  // Additional state for moderator functionality
  const [studentVerifications, setStudentVerifications] = useState([]);
  const [employerVerifications, setEmployerVerifications] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [moderatorActiveTab, setModeratorActiveTab] = useState('students');
  const [loadingModeratorData, setLoadingModeratorData] = useState(false);
  
  // Job feedback modal state
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
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
        
        // Fetch saved jobs
        const savedJobsResponse = await api.getSavedJobs(ucid);
        // Map backend field names to frontend field names if needed
        const formattedSavedJobs = savedJobsResponse.data.map(job => {
          if (job.job) {
            return {
              ...job,
              job: {
                jobId: job.job.JobID || job.job.jobId,
                jobTitle: job.job.JobTitle || job.job.jobTitle,
                companyName: job.job.CompanyName || job.job.companyName,
                location: job.job.Location || job.job.location,
                salary: job.job.Salary || job.job.salary,
                deadline: job.job.Deadline || job.job.deadline,
                description: job.job.Description || job.job.description
              }
            };
          }
          return job;
        });
        setSavedJobs(formattedSavedJobs);
        
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
        
        // Fetch community score
        const communityScoreResponse = await api.getUserCommunityScore('student', ucid);
        setCommunityScore(communityScoreResponse.data.score);
        setPostCount(communityScoreResponse.data.postCount);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };
    
    // Fetch forum posts
    const fetchForumPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await api.getForumPosts();
        // Get latest 3 posts for the dashboard
        setForumPosts(response.data.slice(0, 3));
        setLoadingPosts(false);
      } catch (err) {
        console.error("Error fetching forum posts:", err);
        setLoadingPosts(false);
      }
    };
    
    if (ucid) {
      fetchData();
      fetchForumPosts();
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
  
  // Format date display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Filter active applications
  const activeApplications = applications.filter(app => 
    app.status && !['rejected', 'accepted'].includes(app.status.toLowerCase())
  ).slice(0, 3); // Only show the first 3 active applications
  
  // Only show 3 saved jobs in the dashboard
  const recentSavedJobs = savedJobs.slice(0, 3);
  
  // Check if student is verified
  const isVerified = verificationStatus === 'Verified' || verificationStatus === 'verified' || isModerator;
  const isPending = !isVerified && (verificationStatus === 'Pending' || verificationStatus === 'pending');
  const isRejected = !isVerified && (verificationStatus === 'Rejected' || verificationStatus === 'rejected');
  
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
  
  // Handle rejecting a verification
  const handleRejectVerification = async (type, id) => {
    try {
      const moderatorId = localStorage.getItem('moderatorId');
      
      if (!moderatorId) {
        alert("Unable to reject: Your moderator ID is missing. Please log out and log back in.");
        return;
      }
      
      console.log(`Rejecting ${type} with ID ${id} by moderator ${moderatorId}`);
      
      // Use the updateVerificationStatus method without feedback
      const response = await api.updateVerificationStatus(type, id, 'Rejected');
      console.log(`Rejection response:`, response.data);
      
      // Update local state - remove from pending queue since it's now rejected
      if (type === 'student') {
        setStudentVerifications(prevVerifications => 
          prevVerifications.filter(v => v.applicantUcid !== id)
        );
      } else if (type === 'employer') {
        setEmployerVerifications(prevVerifications => 
          prevVerifications.filter(v => v.employerId !== id)
        );
      }
      
      alert(`${type === 'student' ? 'Student' : 'Employer'} has been rejected successfully.`);
    } catch (err) {
      console.error("Error rejecting verification:", err);
      console.error("Error details:", err.response?.data || "No detailed error information available");
      
      let errorMessage = "Failed to reject verification. ";
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
  
  // Open feedback modal for a job
  const openFeedbackModal = (job) => {
    setCurrentJob(job);
    setFeedbackText('');
    setFeedbackModalVisible(true);
  };

  // Submit job feedback and update status
  const submitJobFeedback = async () => {
    if (!currentJob || !feedbackText.trim()) return;
    
    setSubmittingFeedback(true);
    
    try {
      await api.updateJobStatus(currentJob.jobId, 'Rejected', feedbackText);
      
      // Remove job from pending list
      setPendingJobs(pendingJobs.filter(job => job.jobId !== currentJob.jobId));
      
      // Close modal
      setFeedbackModalVisible(false);
      setCurrentJob(null);
      setFeedbackText('');
      setSubmittingFeedback(false);
      
      alert(`Job has been rejected successfully. The employer will receive your feedback.`);
    } catch (err) {
      console.error("Error rejecting job:", err);
      alert("Failed to reject job. Please try again.");
      setSubmittingFeedback(false);
    }
  };

  // Handle approving a job posting
  const handleApproveJob = async (jobId) => {
    try {
      await api.updateJobStatus(jobId, 'Active');
      
      // Update local state
      setPendingJobs(pendingJobs.filter(job => job.jobId !== jobId));
      
      alert("Job has been approved and is now active.");
    } catch (err) {
      console.error("Error approving job:", err);
      alert("Failed to approve job posting. Please try again.");
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
        
        // Fetch pending job posts
        const jobsResponse = await api.getPendingJobs();
        setPendingJobs(jobsResponse.data);
        
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
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Verification Status Alerts */}
      {isModerator && (
        <Alert variant="danger" className="mb-3">
          <Alert.Heading>Moderator Account</Alert.Heading>
          <p className="mb-0">
            Welcome! As a moderator, you have full access to all NextStep features. You can apply for jobs, manage your applications, and access moderator features from the panel at the bottom of this page.
          </p>
        </Alert>
      )}
      
      {!isModerator && isPending && (
        <Alert variant="warning" className="mb-3">
          <Alert.Heading>Account Verification Pending</Alert.Heading>
          <p>
            Your account is awaiting verification by a moderator. While verification is pending:
          </p>
          <ul>
            <li>You can browse and view all job postings</li>
            <li>You can save jobs for later application</li>
            <li>You can view your application history</li>
            <li>You <strong>cannot apply</strong> for jobs until verification is complete</li>
          </ul>
          <p className="mb-0">We'll notify you once your account has been verified.</p>
        </Alert>
      )}
      
      {!isModerator && isRejected && (
        <Alert variant="danger" className="mb-3">
          <Alert.Heading>Account Verification Rejected</Alert.Heading>
          <p>
            Your account verification was not approved. Please update your profile according to the feedback below:
          </p>
          <p className="mb-2"><strong>Feedback:</strong> {verificationFeedback || 'No specific feedback provided. Please ensure your profile information is complete and accurate.'}</p>
          <p className="mb-0">You can still browse jobs and view previous applications, but you cannot apply for new positions until your account is verified.</p>
          <div className="d-flex justify-content-end mt-2">
            <Button as={Link} to="/profile" variant="outline-danger">
              Update Profile
            </Button>
          </div>
        </Alert>
      )}
      
      {!isModerator && isVerified && (
        <Alert variant="success" className="mb-3">
          <Alert.Heading>Account Verified</Alert.Heading>
          <p className="mb-0">
            Your account has been verified. You have full access to all NextStep features, including applying for jobs.
          </p>
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">Dashboard</h1>
          <p className="text-muted">
            Welcome back! Here's an overview of your job search progress.
            <Badge 
              bg={isModerator ? 'danger' : isVerified ? 'success' : isPending ? 'warning' : 'danger'} 
              className="ms-2"
            >
              {isModerator ? 'Moderator' : isVerified ? 'Verified Account' : isPending ? 'Verification Pending' : 'Verification Required'}
            </Badge>
          </p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/browse" variant="primary" className="me-2">
            Browse Jobs
          </Button>
          <Button as={Link} to="/forum" variant="outline-primary">
            Community Forum
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Application Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{applications.length}</h1>
              <Card.Title>Total Applications</Card.Title>
              <Button as={Link} to="/application-history?tab=all" variant="outline-primary" className="mt-2">
                View All Applications
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{activeApplications.length}</h1>
              <Card.Title>Active Applications</Card.Title>
              <Button as={Link} to="/application-history?tab=active" variant="outline-primary" className="mt-2">
                Check Status
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{savedJobs.length}</h1>
              <Card.Title>Saved Jobs</Card.Title>
              <Button as={Link} to="/saved-jobs" variant="outline-primary" className="mt-2">
                View Saved Jobs
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm bg-light">
            <Card.Body>
              <h1 className="display-4">{communityScore}</h1>
              <Card.Title className="d-flex align-items-center justify-content-center">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Community Score
              </Card.Title>
              <p className="text-muted small">
                From {postCount} forum {postCount === 1 ? 'post' : 'posts'}
              </p>
              <Button as={Link} to="/forum?tab=my-posts" variant="outline-success" className="mt-2">
                <i className="bi bi-list-ul me-2"></i>
                View My Posts
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Active Applications</h5>
              <Button as={Link} to="/application-history?tab=active" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            {activeApplications.length === 0 ? (
              <Card.Body>
                <Alert variant="info">
                  You don't have any active applications right now. Start applying for jobs!
                </Alert>
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {activeApplications.map((application) => (
                  <ListGroup.Item key={application.applicationId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{application.job?.jobTitle || 'Job Title Not Available'}</h6>
                        <p className="mb-1 text-muted small">
                          {application.job?.companyName || 'Company Not Available'} • Applied on {formatDate(application.dateApplied)}
                        </p>
                        <Badge bg={getStatusBadgeVariant(application.status)}>
                          {formatStatus(application.status)}
                        </Badge>
                      </div>
                      <Button 
                        as={Link} 
                        to={`/jobs/${application.jobId}`} 
                        variant="outline-secondary" 
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Saved Jobs</h5>
              <Button as={Link} to="/saved-jobs" variant="link" size="sm">
                View All
              </Button>
            </Card.Header>
            {recentSavedJobs.length === 0 ? (
              <Card.Body>
                <Alert variant="info">
                  You haven't saved any jobs yet. Save jobs you're interested in for later!
                </Alert>
              </Card.Body>
            ) : (
              <ListGroup variant="flush">
                {recentSavedJobs.map((savedJob) => {
                  const job = savedJob.job || {};
                  const daysRemaining = job.deadline ? calculateDaysRemaining(job.deadline) : 0;
                  
                  return (
                    <ListGroup.Item key={savedJob.savedJobId}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{job.jobTitle || 'Job Title Not Available'}</h6>
                          <p className="mb-1 text-muted small">
                            {job.companyName || 'Company Not Available'} • {job.salary ? formatSalary(job.salary) : 'Salary Not Available'}
                          </p>
                          {daysRemaining > 0 ? (
                            <Badge bg={getDeadlineBadgeVariant(daysRemaining)}>
                              {daysRemaining} days left
                            </Badge>
                          ) : (
                            <Badge bg="danger">Deadline passed</Badge>
                          )}
                        </div>
                        <div>
                          <Button 
                            as={Link} 
                            to={!isVerified ? "#" : `/jobs/${job.jobId}/apply`}
                            onClick={!isVerified ? (e) => {
                              e.preventDefault();
                              alert("Your account needs to be verified before you can apply for jobs. Please check your verification status at the top of the dashboard.");
                            } : undefined}
                            variant="primary" 
                            size="sm"
                            className="me-2"
                            disabled={daysRemaining <= 0 || !job.jobId}
                            title={!isVerified ? "Verification required to apply" : ""}
                          >
                            Apply
                          </Button>
                          <Button 
                            as={Link} 
                            to={`/jobs/${job.jobId}`} 
                            variant="outline-secondary" 
                            size="sm"
                            disabled={!job.jobId}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            )}
          </Card>
        </Col>
      </Row>
      
      {/* Forum Posts Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>Recent Forum Posts</span>
                <Button as={Link} to="/forum" variant="link" size="sm">Visit Forum</Button>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingPosts ? (
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                </div>
              ) : forumPosts.length > 0 ? (
                <ListGroup variant="flush">
                  {forumPosts.map(post => (
                    <ListGroup.Item key={post.forumPostId} className="border-bottom py-3">
                      <div className="d-flex">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            <Link to={`/forum?postId=${post.forumPostId}`} style={{ textDecoration: 'none' }}>
                              {post.title}
                            </Link>
                          </h6>
                          <p className="text-muted mb-2">
                            <small>
                              Posted by{' '}
                              <strong>
                                {post.authorType === 'student' ? post.authorName : 
                                 post.authorType === 'employer' ? post.companyName : 
                                 'Moderator'}
                              </strong>
                              {' '}on {formatDate(post.datePosted)}
                            </small>
                            <Badge 
                              bg={
                                post.authorType === 'student' ? 'info' : 
                                post.authorType === 'employer' ? 'primary' : 
                                'danger'
                              }
                              className="ms-2"
                            >
                              {post.authorType === 'student' ? 'Student' : 
                               post.authorType === 'employer' ? 'Employer' : 
                               'Moderator'}
                            </Badge>
                          </p>
                          <p className="mb-0" style={{ 
                            maxWidth: '100%', 
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            textOverflow: 'ellipsis'
                          }}>
                            {post.content}
                          </p>
                          <div className="mt-2">
                            <Button 
                              as={Link} 
                              to={`/forum?postId=${post.forumPostId}`} 
                              variant="outline-secondary" 
                              size="sm"
                            >
                              View Post
                            </Button>
                            {post.authorUcid === ucid && (
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="ms-2"
                                onClick={async () => {
                                  if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
                                    try {
                                      await api.deleteForumPost(post.forumPostId);
                                      setForumPosts(forumPosts.filter(p => p.forumPostId !== post.forumPostId));
                                    } catch (err) {
                                      console.error("Error deleting post:", err);
                                      alert("Failed to delete post. Please try again.");
                                    }
                                  }
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="ms-2 d-flex flex-column align-items-center justify-content-center">
                          <Badge bg="secondary" pill>
                            <i className="bi bi-hand-thumbs-up me-1"></i>
                            {post.upvotes}
                          </Badge>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info">
                  No forum posts yet. <Link to="/forum">Create a post</Link> to start discussions with the community.
                </Alert>
              )}
            </Card.Body>
            <Card.Footer className="text-center">
              <Button as={Link} to="/forum" variant="primary">
                Create New Post
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      {/* Moderator Panel - Show only if user is a moderator */}
      {isModerator && (
        <Row className="mb-4">
          <Col>
            <Card className="border-danger">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Moderator Actions</h5>
              </Card.Header>
              <Card.Body>
                {loadingModeratorData ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading verification data...</p>
                  </div>
                ) : (
                  <>
                    <Tabs
                      activeKey={moderatorActiveTab}
                      onSelect={(k) => setModeratorActiveTab(k)}
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
                      
                      <Tab eventKey="jobs" title={`Pending Jobs (${pendingJobs.length})`}>
                        {pendingJobs.length === 0 ? (
                          <Alert variant="info">No pending job postings to review.</Alert>
                        ) : (
                          <ListGroup variant="flush">
                            {pendingJobs.map(job => (
                              <ListGroup.Item key={job.jobId}>
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <h5 className="mb-1">{job.jobTitle}</h5>
                                    <p className="mb-1">
                                      <Badge bg="primary" className="me-2">{job.companyName}</Badge>
                                      <Badge bg="secondary" className="me-2">{job.location}</Badge>
                                      <Badge bg="info">{formatSalary(job.salary)}</Badge>
                                    </p>
                                    <p className="mb-1"><strong>Deadline:</strong> {formatDate(job.deadline)}</p>
                                    <p className="mb-0" style={{ 
                                      maxWidth: '100%', 
                                      overflow: 'hidden',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {job.description}
                                    </p>
                                    <div className="mt-2">
                                      <Button 
                                        as={Link}
                                        to={`/jobs/${job.jobId}`}
                                        variant="outline-info" 
                                        size="sm"
                                        className="me-2"
                                      >
                                        <i className="bi bi-eye me-1"></i>
                                        View Details
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="d-flex flex-column">
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      className="mb-2"
                                      onClick={() => handleApproveJob(job.jobId)}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={() => openFeedbackModal(job)}
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
      
      {/* Job Feedback Modal */}
      {isModerator && (
        <Modal show={feedbackModalVisible} onHide={() => setFeedbackModalVisible(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              Reject Job Posting
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Please provide feedback to the employer about why this job posting is being rejected and what changes are needed for approval.
            </p>
            <Form.Group>
              <Form.Label>Feedback</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Enter your feedback here..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setFeedbackModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={submitJobFeedback}
              disabled={submittingFeedback || !feedbackText.trim()}
            >
              {submittingFeedback ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Submitting...
                </>
              ) : (
                'Reject Job Posting'
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

export default StudentDashboard; 