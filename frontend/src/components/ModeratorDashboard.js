import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ModeratorDashboard() {
  const [forumPosts, setForumPosts] = useState([]);
  const [studentVerifications, setStudentVerifications] = useState([]);
  const [employerVerifications, setEmployerVerifications] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [communityScore, setCommunityScore] = useState(0);
  const [postCount, setPostCount] = useState(0);
  
  const navigate = useNavigate();
  const moderatorId = localStorage.getItem('moderatorId');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!moderatorId || userRole !== 'moderator') {
      navigate('/login');
    }
  }, [moderatorId, userRole, navigate]);
  
  // Enhanced job approval functionality
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [feedbackAction, setFeedbackAction] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  // Verification feedback modal state
  const [verificationFeedbackModalVisible, setVerificationFeedbackModalVisible] = useState(false);
  const [currentVerification, setCurrentVerification] = useState(null);
  const [currentVerificationType, setCurrentVerificationType] = useState('');
  const [verificationFeedbackText, setVerificationFeedbackText] = useState('');
  const [submittingVerificationFeedback, setSubmittingVerificationFeedback] = useState(false);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch forum posts
        const forumPostsResponse = await api.getForumPosts();
        // Sort by upvotes (trending first)
        const sortedPosts = forumPostsResponse.data.sort((a, b) => b.upvotes - a.upvotes);
        setForumPosts(sortedPosts);
        
        // Fetch pending student verifications
        const studentVerificationsResponse = await api.getVerifications('student', 'Pending');
        setStudentVerifications(studentVerificationsResponse.data);
        
        // Fetch pending employer verifications
        const employerVerificationsResponse = await api.getVerifications('employer', 'Pending');
        setEmployerVerifications(employerVerificationsResponse.data);
        
        // Fetch pending job posts
        const jobsResponse = await api.getJobs({ status: 'Pending' });
        setPendingJobs(jobsResponse.data);
        
        // Fetch moderator's community score
        const communityScoreResponse = await api.getUserCommunityScore('moderator', moderatorId);
        setCommunityScore(communityScoreResponse.data.score);
        setPostCount(communityScoreResponse.data.postCount);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };
    
    if (moderatorId) {
      fetchData();
    }
  }, [moderatorId]);
  
  // Handle deleting a forum post
  const handleDeleteForumPost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await api.deleteForumPost(postId);
        
        // Remove the post from local state
        setForumPosts(forumPosts.filter(post => post.forumPostId !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Failed to delete post. Please try again.");
      }
    }
  };
  
  // Handle approving a verification
  const handleApproveVerification = async (type, id) => {
    try {
      await api.approveVerification(type, id);
      
      // Update local state
      if (type === 'student') {
        setStudentVerifications(studentVerifications.filter(v => v.vid !== id));
      } else if (type === 'employer') {
        setEmployerVerifications(employerVerifications.filter(v => v.vid !== id));
      }
      
      alert(`${type === 'student' ? 'Student' : 'Employer'} account has been verified successfully.`);
    } catch (err) {
      console.error("Error approving verification:", err);
      alert("Failed to approve verification. Please try again.");
    }
  };
  
  // Open verification feedback modal for rejection
  const openVerificationFeedbackModal = (type, verification) => {
    setCurrentVerification(verification);
    setCurrentVerificationType(type);
    setVerificationFeedbackText('');
    setVerificationFeedbackModalVisible(true);
  };
  
  // Handle rejecting a verification with feedback
  const handleRejectVerification = async () => {
    if (!currentVerification || !verificationFeedbackText.trim()) return;
    
    setSubmittingVerificationFeedback(true);
    
    try {
      const id = currentVerificationType === 'student' 
        ? currentVerification.applicantUcid 
        : currentVerification.employerId;
      
      await api.rejectVerification(currentVerificationType, id, verificationFeedbackText);
      
      // Update local state
      if (currentVerificationType === 'student') {
        setStudentVerifications(studentVerifications.filter(v => v.vid !== currentVerification.vid));
      } else if (currentVerificationType === 'employer') {
        setEmployerVerifications(employerVerifications.filter(v => v.vid !== currentVerification.vid));
      }
      
      // Close modal
      setVerificationFeedbackModalVisible(false);
      setCurrentVerification(null);
      setCurrentVerificationType('');
      setVerificationFeedbackText('');
      setSubmittingVerificationFeedback(false);
      
      alert(`${currentVerificationType === 'student' ? 'Student' : 'Employer'} verification has been rejected with feedback.`);
    } catch (err) {
      console.error("Error rejecting verification:", err);
      alert("Failed to reject verification. Please try again.");
      setSubmittingVerificationFeedback(false);
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
      await api.rejectJob(currentJob.jobId, feedbackText);
      
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
      await api.updateJob(jobId, { status: 'Active' });
      
      // Update local state
      setPendingJobs(pendingJobs.filter(job => job.jobId !== jobId));
      
      alert("Job has been approved and is now active.");
    } catch (err) {
      console.error("Error approving job:", err);
      alert("Failed to approve job posting. Please try again.");
    }
  };
  
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format salary
  const formatSalary = (salary) => {
    return salary ? `$${salary.toLocaleString()}` : 'Not specified';
  };
  
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
          <h1 className="mb-0">Moderator Dashboard</h1>
          <p className="text-muted">Review and manage platform content</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/browse" variant="primary" className="me-2">
            <i className="bi bi-briefcase me-2"></i>
            Browse Jobs
          </Button>
          <Button as={Link} to="/forum" variant="outline-primary">
            <i className="bi bi-chat-text me-2"></i>
            Visit Forum
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Dashboard Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{pendingJobs.length}</h1>
              <Card.Title>Pending Jobs</Card.Title>
              <Button 
                onClick={() => document.getElementById('moderator-tabs').querySelector('[data-rb-event-key="jobs"]').click()} 
                variant="outline-primary" 
                className="mt-2"
              >
                <i className="bi bi-clipboard-check me-1"></i>
                Review Jobs
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{studentVerifications.length}</h1>
              <Card.Title>Student Verifications</Card.Title>
              <Button 
                onClick={() => document.getElementById('moderator-tabs').querySelector('[data-rb-event-key="students"]').click()}
                variant="outline-primary" 
                className="mt-2"
              >
                <i className="bi bi-person-check me-1"></i>
                Review Students
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center h-100 shadow-sm">
            <Card.Body>
              <h1 className="display-4">{employerVerifications.length}</h1>
              <Card.Title>Employer Verifications</Card.Title>
              <Button 
                onClick={() => document.getElementById('moderator-tabs').querySelector('[data-rb-event-key="employers"]').click()}
                variant="outline-primary" 
                className="mt-2"
              >
                <i className="bi bi-building me-1"></i>
                Review Employers
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
              <Button 
                as={Link}
                to="/forum?tab=my-posts"
                variant="outline-success" 
                className="mt-2"
              >
                <i className="bi bi-list-ul me-2"></i>
                View My Posts
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Main Content */}
      <Tabs defaultActiveKey="forum" id="moderator-tabs" className="mb-4">
        <Tab eventKey="forum" title="Forum Posts">
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Trending Forum Posts</h5>
              <Button as={Link} to="/forum" variant="link" size="sm">View All</Button>
            </Card.Header>
            <ListGroup variant="flush">
              {forumPosts.length === 0 ? (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">No forum posts to review.</Alert>
                </ListGroup.Item>
              ) : (
                forumPosts.map(post => (
                  <ListGroup.Item key={post.forumPostId}>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="mb-1">{post.title}</h5>
                        <p className="mb-1 text-muted">
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
                          <Badge bg="secondary" className="ms-2">
                            <i className="bi bi-hand-thumbs-up me-1"></i>
                            {post.upvotes} upvotes
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
                      </div>
                      <div className="d-flex flex-column">
                        <Button 
                          as={Link} 
                          to={`/forum?postId=${post.forumPostId}`}
                          variant="outline-primary" 
                          size="sm"
                          className="mb-2"
                        >
                          View
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteForumPost(post.forumPostId)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Tab>
        
        <Tab eventKey="jobs" title={`Pending Jobs (${pendingJobs.length})`}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Job Postings</h5>
            </Card.Header>
            <Card.Body>
              <p>Review and approve or reject job postings before they appear on the platform.</p>
            </Card.Body>
            <ListGroup variant="flush">
              {pendingJobs.length === 0 ? (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">No pending job postings to review.</Alert>
                </ListGroup.Item>
              ) : (
                pendingJobs.map(job => (
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
                          onClick={() => openVerificationFeedbackModal('student', job)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Tab>
        
        <Tab eventKey="students" title={`Student Verifications (${studentVerifications.length})`}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Student Verifications</h5>
            </Card.Header>
            <Card.Body>
              <p>Review and verify student accounts to grant them access to the platform.</p>
            </Card.Body>
            <ListGroup variant="flush">
              {studentVerifications.length === 0 ? (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">No pending student verifications.</Alert>
                </ListGroup.Item>
              ) : (
                studentVerifications.map(verification => (
                  <ListGroup.Item key={verification.vid}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">{verification.student.name}</h5>
                        <p className="mb-1">
                          <strong>UCID:</strong> {verification.student.ucid}<br />
                          <strong>Email:</strong> {verification.student.email}<br />
                          <strong>Major:</strong> {verification.student.major}<br />
                          <strong>Graduation Year:</strong> {verification.student.graduationYear}
                        </p>
                      </div>
                      <div className="d-flex">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproveVerification('student', verification.vid)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => openVerificationFeedbackModal('student', verification)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Tab>
        
        <Tab eventKey="employers" title={`Employer Verifications (${employerVerifications.length})`}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Employer Verifications</h5>
            </Card.Header>
            <Card.Body>
              <p>Review and verify employer accounts to grant them access to post jobs.</p>
            </Card.Body>
            <ListGroup variant="flush">
              {employerVerifications.length === 0 ? (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">No pending employer verifications.</Alert>
                </ListGroup.Item>
              ) : (
                employerVerifications.map(verification => (
                  <ListGroup.Item key={verification.vid}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">{verification.employer.companyName}</h5>
                        <p className="mb-1">
                          <strong>Email:</strong> {verification.employer.email}<br />
                          <strong>Industry:</strong> {verification.employer.industry}
                        </p>
                      </div>
                      <div className="d-flex">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleApproveVerification('employer', verification.vid)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => openVerificationFeedbackModal('employer', verification)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card>
        </Tab>
      </Tabs>
      
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
                  <Button as={Link} to="/forum" variant="outline-primary" className="w-100">
                    <i className="bi bi-chat-text me-2"></i>
                    Go to Forum
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button as={Link} to="/browse" variant="outline-primary" className="w-100">
                    <i className="bi bi-briefcase me-2"></i>
                    Browse Jobs
                  </Button>
                </Col>
                <Col md={3} className="mb-3 mb-md-0">
                  <Button variant="outline-primary" className="w-100" onClick={() => document.getElementById('moderator-tabs').querySelector('[data-rb-event-key="jobs"]').click()}>
                    <i className="bi bi-clipboard-check me-2"></i>
                    Review Jobs
                  </Button>
                </Col>
                <Col md={3}>
                  <Button variant="outline-primary" className="w-100" onClick={() => document.getElementById('moderator-tabs').querySelector('[data-rb-event-key="students"]').click()}>
                    <i className="bi bi-person-check me-2"></i>
                    Review Students
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Verification Feedback Modal */}
      <Modal show={verificationFeedbackModalVisible} onHide={() => setVerificationFeedbackModalVisible(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Reject Verification
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Please provide feedback to the applicant about why this verification is being rejected and what changes are needed for approval.
          </p>
          <Form.Group>
            <Form.Label>Feedback</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              value={verificationFeedbackText}
              onChange={(e) => setVerificationFeedbackText(e.target.value)}
              placeholder="Enter your feedback here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setVerificationFeedbackModalVisible(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectVerification}
            disabled={submittingVerificationFeedback || !verificationFeedbackText.trim()}
          >
            {submittingVerificationFeedback ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : (
              'Reject Verification'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ModeratorDashboard; 