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
  const [forumPosts, setForumPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
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
        
        // For demo, just get employer from our mock data
        const employerResponse = await api.getJobs(); // This is a workaround since we don't have a direct employer endpoint
        const matchedEmployer = employerResponse.data[0]?.employerId === employerId ? 
          { employerId, companyName: employerResponse.data[0].companyName } : 
          { employerId, companyName: "Your Company" };
        
        setEmployer(matchedEmployer);

        // Fetch employer's job postings
        const jobsResponse = await api.getJobs();
        const filteredJobs = jobsResponse.data.filter(job => job.employerId === employerId);
        setJobs(filteredJobs);

        // Fetch applications for employer's jobs
        const applicationsResponse = await api.getApplications({ employerId });
        setApplications(applicationsResponse.data);

        // Fetch community score
        const communityScoreResponse = await api.getUserCommunityScore('employer', employerId);
        setEmployer({
          ...matchedEmployer,
          communityScore: communityScoreResponse.data.score,
          postCount: communityScoreResponse.data.postCount
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
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

    if (employerId) {
      fetchDashboardData();
      fetchForumPosts();
    }
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

  // Format date display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
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
          {employer?.communityScore > 0 && (
            <Badge bg="success" className="d-inline-flex align-items-center mt-2" style={{ fontSize: '1rem', padding: '8px 12px' }}>
              <i className="bi bi-star-fill me-2"></i>
              Community Score: {employer?.communityScore}
              <span className="ms-1">({employer?.postCount || 0} {employer?.postCount === 1 ? 'post' : 'posts'})</span>
            </Badge>
          )}
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/manage-jobs/new" variant="primary" className="me-2" disabled={!isVerified}>
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
                  <p>ID: {employer?.employerId}</p>
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
                    <Button as={Link} to="/manage-jobs/new" variant="primary" className="mb-2" disabled={!isVerified}>
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

      {/* Application Stats */}
      <Row className="mb-4">
        <Col md={7}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Application Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {Object.entries(applicationStatusCounts).map(([status, count]) => (
                  <Col key={status} xs={6} md={4} className="mb-3">
                    <div className="text-center">
                      <h3 className="mb-2">{count}</h3>
                      <Badge 
                        bg={getStatusBadgeVariant(status)}
                        style={{ width: '100%', display: 'block', padding: '8px' }}
                      >
                        {status}
                      </Badge>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card.Body>
            <Card.Footer className="text-center">
              <Button as={Link} to="/applications" variant="link">View All Applications</Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Community Engagement</h5>
              <Button as={Link} to="/forum" variant="link" size="sm">Visit Forum</Button>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="display-4">{employer?.communityScore || 0}</h1>
              <Card.Title className="d-flex align-items-center justify-content-center">
                <i className="bi bi-star-fill text-warning me-2"></i>
                Community Score
              </Card.Title>
              <p className="text-muted small">
                From {employer?.postCount || 0} forum {employer?.postCount === 1 ? 'post' : 'posts'}
              </p>
              <Button as={Link} to="/forum?tab=my-posts" variant="outline-success" className="mt-2">
                <i className="bi bi-list-ul me-2"></i>
                View My Posts
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Job Postings and Recent Applications */}
      <Row className="mb-4">
        <Col md={7}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Active Job Postings</h5>
              <Button as={Link} to="/manage-jobs" variant="link" size="sm">View All</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {jobs.length > 0 ? (
                jobs.slice(0, 3).map((job) => (
                  <ListGroup.Item key={job.jobId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{job.jobTitle}</h6>
                        <small className="text-muted">Location: {job.location}</small>
                      </div>
                      <div>
                        <Badge bg="info" className="me-2">
                          {applicationCounts[job.jobId] || 0} Applications
                        </Badge>
                        <Button 
                          as={Link} 
                          to={`/manage-jobs/${job.jobId}`} 
                          variant="outline-primary" 
                          size="sm"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">
                    No job postings yet. Create your first job posting!
                  </Alert>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recently Applied</h5>
              <Button as={Link} to="/applications" variant="link" size="sm">View All</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {applications.length > 0 ? (
                applications.slice(0, 3).map((application) => (
                  <ListGroup.Item key={application.applicationId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{application.student?.name}</h6>
                        <small className="d-block">{application.job?.jobTitle}</small>
                        <small className="text-muted">Applied: {new Date(application.dateApplied).toLocaleDateString()}</small>
                      </div>
                      <Button 
                        as={Link} 
                        to={`/applications/${application.applicationId}`} 
                        variant="outline-primary" 
                        size="sm"
                      >
                        View
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">
                    No applications received yet.
                  </Alert>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>

      {/* Forum Posts Section */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Forum Posts</h5>
              <Button as={Link} to="/forum" variant="link" size="sm">Visit Forum</Button>
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
                            {post.authorEmployerId === parseInt(employerId) && (
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
      
      {/* Quick Actions */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/manage-jobs/new" variant="outline-primary" className="w-100">
                    <i className="bi bi-plus-circle me-2"></i>
                    Post New Job
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/manage-jobs" variant="outline-primary" className="w-100">
                    <i className="bi bi-briefcase me-2"></i>
                    Manage Jobs
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/applications" variant="outline-primary" className="w-100">
                    <i className="bi bi-file-earmark-person me-2"></i>
                    View Applications
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

export default EmployerDashboard; 