import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner, ListGroup, Tabs, Tab } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function JobDetails() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get user information from localStorage
  const ucid = localStorage.getItem('ucid');
  const employerId = localStorage.getItem('employerId');
  const userRole = localStorage.getItem('userRole');
  
  const isEmployer = userRole === 'employer';
  const isStudent = userRole === 'student';
  
  // Fetch job details
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        const response = await api.getJob(parseInt(id));
        if (response && response.data) {
          setJob(response.data);
          
          // If user is a student, check if they've saved or applied to this job
          if (isStudent && ucid) {
            const savedJobsResponse = await api.getSavedJobs(ucid);
            const isJobSaved = savedJobsResponse.data.some(savedJob => savedJob.job.jobId === parseInt(id));
            setIsSaved(isJobSaved);
            
            const applicationsResponse = await api.getStudentApplications(ucid);
            const hasStudentApplied = applicationsResponse.data.some(app => app.jobId === parseInt(id));
            setHasApplied(hasStudentApplied);
          }
          
          // If user is an employer and owns this job, fetch applicants
          if (isEmployer && employerId && response.data.employerId === parseInt(employerId)) {
            setLoadingApplicants(true);
            const applicantsResponse = await api.getJobApplicants(parseInt(id));
            if (applicantsResponse && applicantsResponse.data) {
              setApplicants(applicantsResponse.data);
            }
            setLoadingApplicants(false);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details. Please try again later.');
        setLoading(false);
      }
    };
    
    if (id) {
      fetchJobDetails();
    }
  }, [id, ucid, employerId, isStudent, isEmployer]);
  
  // Handle saving/unsaving a job
  const handleSaveToggle = async () => {
    if (!isStudent || !ucid) {
      navigate('/login');
      return;
    }
    
    try {
      if (isSaved) {
        await api.unsaveJob(ucid, job.jobId);
        setIsSaved(false);
      } else {
        await api.saveJob(ucid, job.jobId);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling saved job status:', err);
      alert('Failed to update saved status. Please try again.');
    }
  };
  
  // Format salary
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };
  
  // Calculate days remaining until deadline
  const calculateDaysRemaining = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Process multiline text for display
  const formatMultilineText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <div key={index}>{line}</div>
    ));
  };
  
  const deadlineRemaining = job ? calculateDaysRemaining(job.deadline) : 0;
  const isDeadlinePassed = deadlineRemaining <= 0;
  
  // Loading state
  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading job details...</span>
        </Spinner>
      </Container>
    );
  }
  
  // Error state
  if (error || !job) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error || 'Job not found'}
        </Alert>
        <Button as={Link} to="/browse" variant="primary">
          Back to Jobs
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      {/* Job Header Section */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="mb-1">{job.jobTitle}</h1>
              <div className="d-flex align-items-center mb-3">
                <h5 className="mb-0 text-primary">{job.companyName}</h5>
                {job.isUrgent && (
                  <Badge bg="danger" className="ms-2">Urgent</Badge>
                )}
                {job.isRemote && (
                  <Badge bg="info" className="ms-2">Remote</Badge>
                )}
                {job.eligibleForInternship && (
                  <Badge bg="success" className="ms-2">Internship Eligible</Badge>
                )}
              </div>
              <div className="mb-3">
                <Badge bg="secondary" className="me-2">
                  <i className="bi bi-geo-alt me-1"></i>
                  {job.location}
                </Badge>
                <Badge bg="secondary" className="me-2">
                  <i className="bi bi-cash me-1"></i>
                  {formatSalary(job.salary)}
                </Badge>
                {job.status === 'Pending' && (
                  <Badge bg="warning" className="me-2">Pending Approval</Badge>
                )}
                {job.status === 'Rejected' && (
                  <Badge bg="danger" className="me-2">Rejected</Badge>
                )}
                {job.status === 'Active' && job.deadline && (
                  <Badge bg={
                    isDeadlinePassed ? 'danger' :
                    deadlineRemaining <= 3 ? 'warning' :
                    'primary'
                  }>
                    <i className="bi bi-calendar me-1"></i>
                    {isDeadlinePassed ? 
                      'Deadline passed' : 
                      `${deadlineRemaining} days remaining`}
                  </Badge>
                )}
              </div>
              
              {/* Display feedback for rejected jobs */}
              {job.status === 'Rejected' && job.feedback && (
                <Alert variant="danger" className="mb-3">
                  <strong>Moderator Feedback:</strong> {job.feedback}
                  <p className="mt-2 mb-0">
                    <small>Please edit this job posting according to the moderator's feedback and resubmit for approval.</small>
                  </p>
                </Alert>
              )}
              
              <div>
                <p><strong>Posted by:</strong> {job.companyName}</p>
                <p><strong>Application Deadline:</strong> {formatDate(job.deadline)}</p>
              </div>
            </Col>
            <Col md={4} className="text-md-end">
              {isStudent ? (
                <>
                  <Button 
                    as={Link} 
                    to={`/jobs/${job.jobId}/apply`} 
                    variant="primary" 
                    size="lg" 
                    className="mb-2 w-100"
                    disabled={isDeadlinePassed || hasApplied || job.status !== 'Active'}
                  >
                    {hasApplied ? 'Already Applied' : 
                     job.status !== 'Active' ? 'Not Available' : 'Apply Now'}
                  </Button>
                  <Button 
                    variant={isSaved ? "outline-danger" : "outline-primary"} 
                    onClick={handleSaveToggle}
                    className="w-100"
                  >
                    <i className={`bi ${isSaved ? 'bi-bookmark-check-fill' : 'bi-bookmark'} me-2`}></i>
                    {isSaved ? 'Unsave Job' : 'Save Job'}
                  </Button>
                </>
              ) : isEmployer && job.employerId === parseInt(employerId) ? (
                <>
                  <Button 
                    as={Link} 
                    to={`/manage-jobs/${job.jobId}`}
                    variant="outline-primary" 
                    className="mb-2 w-100"
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Edit Job Posting
                  </Button>
                  <Button 
                    variant="outline-secondary"
                    className="w-100"
                    as={Link}
                    to={`/applications?jobId=${job.jobId}`}
                    disabled={job.status !== 'Active'}
                  >
                    <i className="bi bi-people me-2"></i>
                    View All Applicants
                  </Button>
                </>
              ) : (
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="primary"
                  className="mb-2 w-100"
                  disabled={job.status !== 'Active'}
                >
                  Sign in to Apply
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Job Content Section */}
      <Row>
        <Col md={8}>
          {/* Main Job Description */}
          <Card className="mb-4">
            <Card.Header>
              <h4>Job Description</h4>
            </Card.Header>
            <Card.Body>
              <p>{job.description}</p>
              
              <h5 className="mt-4">Requirements</h5>
              <div className="mb-4">
                {formatMultilineText(job.requirements)}
              </div>
              
              <h5 className="mt-4">Responsibilities</h5>
              <div className="mb-4">
                {formatMultilineText(job.responsibilities)}
              </div>
              
              <h5 className="mt-4">Benefits</h5>
              <div>
                {formatMultilineText(job.benefits)}
              </div>
            </Card.Body>
          </Card>
          
          {/* For employers: Applicants Tab */}
          {isEmployer && job.employerId === parseInt(employerId) && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Recent Applicants</h4>
              </Card.Header>
              <Card.Body>
                {loadingApplicants ? (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />
                    <span className="ms-2">Loading applicants...</span>
                  </div>
                ) : applicants.length === 0 ? (
                  <Alert variant="info">
                    No applicants for this position yet.
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {applicants.slice(0, 5).map(applicant => (
                      <ListGroup.Item key={applicant.applicationId} className="py-3">
                        <Row>
                          <Col md={8}>
                            <h5 className="mb-1">{applicant.student.name}</h5>
                            <p className="mb-1 text-muted">
                              {applicant.student.major} • Applied on {formatDate(applicant.dateApplied)}
                            </p>
                            <Badge 
                              bg={
                                applicant.status === 'Submitted' ? 'warning' :
                                applicant.status === 'Under Review' ? 'info' :
                                applicant.status === 'Rejected' ? 'danger' :
                                applicant.status === 'Interview' ? 'primary' :
                                'success'
                              }
                            >
                              {applicant.status}
                            </Badge>
                          </Col>
                          <Col md={4} className="text-end">
                            <Button 
                              as={Link} 
                              to={`/applications/${applicant.applicationId}`}
                              variant="outline-primary"
                              size="sm"
                            >
                              Review
                            </Button>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                <div className="text-center mt-3">
                  <Button 
                    as={Link}
                    to={`/applications?jobId=${job.jobId}`}
                    variant="outline-primary"
                  >
                    View All Applicants
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* For students: Similar Jobs */}
          {isStudent && (
            <Card className="mb-4">
              <Card.Header>
                <h4>Similar Jobs You Might Like</h4>
              </Card.Header>
              <ListGroup variant="flush">
                {[1, 2, 3].map(i => {
                  // Display other jobs from same company or similar jobs
                  const similarJob = {
                    jobId: job.jobId + 100 + i,
                    jobTitle: `Similar ${job.jobTitle} ${i}`,
                    companyName: i % 2 === 0 ? job.companyName : `Other Company ${i}`,
                    location: job.location,
                    salary: job.salary - 5000 + (i * 10000)
                  };
                  
                  return (
                    <ListGroup.Item key={i} action as={Link} to={`/jobs/${similarJob.jobId}`}>
                      <h5 className="mb-1">{similarJob.jobTitle}</h5>
                      <p className="mb-1 text-muted">
                        {similarJob.companyName} • {similarJob.location}
                      </p>
                      <Badge bg="secondary">
                        {formatSalary(similarJob.salary)}
                      </Badge>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card>
          )}
        </Col>
        
        {/* Sidebar */}
        <Col md={4}>
          {/* Application Status - For Students Only */}
          {isStudent && hasApplied && (
            <Card className="mb-4 bg-light">
              <Card.Body>
                <h5>Your Application Status</h5>
                <Badge 
                  bg="success" 
                  style={{ padding: '8px', fontSize: '1rem', display: 'inline-block', marginTop: '8px' }}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Applied
                </Badge>
                <p className="mt-3">
                  You applied to this position on {formatDate(new Date().toISOString())}.
                  Check your <Link to="/applications">application status</Link> for updates.
                </p>
              </Card.Body>
            </Card>
          )}
          
          {/* Job Summary Card */}
          <Card className="mb-4">
            <Card.Header>
              <h5>Job Summary</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <i className="bi bi-building me-2"></i>
                <strong>Company:</strong> {job.companyName}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-geo-alt me-2"></i>
                <strong>Location:</strong> {job.location}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-cash me-2"></i>
                <strong>Salary:</strong> {formatSalary(job.salary)}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-calendar me-2"></i>
                <strong>Application Deadline:</strong> {formatDate(job.deadline)}
              </ListGroup.Item>
              <ListGroup.Item>
                <i className="bi bi-people me-2"></i>
                <strong>Applicants:</strong> {job.applicationsCount || 0}
              </ListGroup.Item>
            </ListGroup>
          </Card>
          
          {/* Company Info Card - Different for Employers vs Students */}
          <Card className="mb-4">
            <Card.Header>
              <h5>About {job.companyName}</h5>
            </Card.Header>
            <Card.Body>
              <p>
                {job.companyName} is a leading company in the industry, known for innovation and excellence.
              </p>
              {isStudent ? (
                <>
                  <p>Learn more about working at {job.companyName} and explore their culture.</p>
                  <Button variant="outline-primary" className="w-100">
                    View Company Profile
                  </Button>
                </>
              ) : isEmployer && job.employerId === parseInt(employerId) ? (
                <>
                  <p>Manage your company profile to attract more qualified candidates.</p>
                  <Button variant="outline-primary" className="w-100">
                    Edit Company Profile
                  </Button>
                </>
              ) : (
                <p>Sign in to learn more about this company.</p>
              )}
            </Card.Body>
          </Card>
          
          {/* Application Tips - For Students Only */}
          {isStudent && !hasApplied && !isDeadlinePassed && (
            <Card className="border-primary">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Application Tips</h5>
              </Card.Header>
              <Card.Body>
                <p><i className="bi bi-lightbulb me-2"></i> Tailor your resume to highlight relevant skills for this position.</p>
                <p><i className="bi bi-file-earmark-text me-2"></i> Write a personalized cover letter explaining why you're a good fit.</p>
                <p><i className="bi bi-clock me-2"></i> Submit your application early to stand out from other candidates.</p>
                <div className="d-grid">
                  <Button 
                    as={Link} 
                    to={`/jobs/${job.jobId}/apply`} 
                    variant="primary"
                  >
                    Apply Now
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Job Statistics - For Employers Only */}
          {isEmployer && job.employerId === parseInt(employerId) && (
            <Card className="border-primary">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Job Posting Statistics</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <div className="text-center">
                    <h2>{job.applicationsCount || 0}</h2>
                    <p className="mb-0">Applicants</p>
                  </div>
                  <div className="text-center">
                    <h2>{job.viewCount || 0}</h2>
                    <p className="mb-0">Views</p>
                  </div>
                  <div className="text-center">
                    <h2>{Math.round((job.applicationsCount || 0) / Math.max(job.viewCount || 1, 1) * 100)}%</h2>
                    <p className="mb-0">Apply Rate</p>
                  </div>
                </div>
                <div className="d-grid">
                  <Button 
                    as={Link} 
                    to={`/job-analytics/${job.jobId}`} 
                    variant="outline-primary"
                  >
                    View Detailed Analytics
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default JobDetails; 