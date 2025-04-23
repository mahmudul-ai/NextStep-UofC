import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Tab, Tabs } from 'react-bootstrap';
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
  
  const navigate = useNavigate();
  const ucid = localStorage.getItem('ucid');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!ucid || userRole !== 'student') {
      navigate('/login');
    }
  }, [ucid, userRole, navigate]);
  
  // Check verification status
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await api.checkVerificationStatus('student', ucid);
        setVerificationStatus(response.data.status);
        setVerificationFeedback(response.data.feedback);
      } catch (err) {
        console.error("Error checking verification status:", err);
      }
    };
    
    if (ucid) {
      checkVerification();
    }
  }, [ucid]);
  
  // Fetch saved jobs and applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch saved jobs
        const savedJobsResponse = await api.getSavedJobs(ucid);
        setSavedJobs(savedJobsResponse.data);
        
        // Fetch applications
        const applicationsResponse = await api.getStudentApplications(ucid);
        // Sort applications by date applied (newest first)
        const sortedApplications = applicationsResponse.data.sort((a, b) => 
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
    !['rejected', 'accepted'].includes(app.status.toLowerCase())
  ).slice(0, 3); // Only show the first 3 active applications
  
  // Only show 3 saved jobs in the dashboard
  const recentSavedJobs = savedJobs.slice(0, 3);
  
  // Check if student is verified
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
            Your account is awaiting verification by a moderator. Once verified, you'll be able to apply for jobs.
            You can still browse jobs and save them for later.
          </p>
        </Alert>
      )}
      
      {isRejected && (
        <Alert variant="danger" className="mb-3">
          <Alert.Heading>Account Verification Rejected</Alert.Heading>
          <p>
            Your account verification was not approved. Please update your profile according to the feedback below:
          </p>
          <p className="mb-0"><strong>Feedback:</strong> {verificationFeedback}</p>
          <div className="d-flex justify-content-end mt-2">
            <Button as={Link} to="/profile" variant="outline-danger">
              Update Profile
            </Button>
          </div>
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">Student Dashboard</h1>
          <p className="text-muted">Welcome back! Here's an overview of your job search progress.</p>
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
              <Button as={Link} to="/application-history?tab=all" variant="outline-primary" className="mt-2" disabled={!isVerified}>
                View All Applications
              </Button>
              {!isVerified && (
                <div className="mt-2">
                  <small className="text-muted">Verification required</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{activeApplications.length}</h1>
              <Card.Title>Active Applications</Card.Title>
              <Button as={Link} to="/application-history?tab=active" variant="outline-primary" className="mt-2" disabled={!isVerified}>
                Check Status
              </Button>
              {!isVerified && (
                <div className="mt-2">
                  <small className="text-muted">Verification required</small>
                </div>
              )}
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
                        <h6 className="mb-1">{application.job.jobTitle}</h6>
                        <p className="mb-1 text-muted small">
                          {application.job.companyName} • Applied on {new Date(application.dateApplied).toLocaleDateString()}
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
                  const job = savedJob.job;
                  const daysRemaining = calculateDaysRemaining(job.deadline);
                  
                  return (
                    <ListGroup.Item key={savedJob.savedJobId}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{job.jobTitle}</h6>
                          <p className="mb-1 text-muted small">
                            {job.companyName} • {formatSalary(job.salary)}
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
                            to={`/jobs/${job.jobId}/apply`} 
                            variant="primary" 
                            size="sm"
                            className="me-2"
                            disabled={daysRemaining <= 0}
                          >
                            Apply
                          </Button>
                          <Button 
                            as={Link} 
                            to={`/jobs/${job.jobId}`} 
                            variant="outline-secondary" 
                            size="sm"
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
      
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/browse" variant="outline-primary" className="w-100">
                    <i className="bi bi-search me-2"></i>
                    Browse Job Listings
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/profile" variant="outline-primary" className="w-100">
                    <i className="bi bi-person me-2"></i>
                    Update Profile
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/saved-jobs" variant="outline-primary" className="w-100">
                    <i className="bi bi-bookmark me-2"></i>
                    Manage Saved Jobs
                  </Button>
                </Col>
                <Col md={3}>
                  <Button as={Link} to="/forum" variant="outline-primary" className="w-100">
                    <i className="bi bi-chat-text me-2"></i>
                    Community Forum
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default StudentDashboard; 