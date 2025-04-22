// Import necessary React hooks and UI components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Tab, Tabs, Badge, Alert, Spinner, ListGroup } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function ManageJobs({ isNew }) {
  // Get job ID from URL if provided
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State for job list and job form inputs
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobFormData, setJobFormData] = useState({
    jobTitle: '',
    description: '',
    location: '',
    salary: '',
    deadline: '',
    requirements: '',
    responsibilities: '',
    benefits: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editMode, setEditMode] = useState(isNew || false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');

  const employerId = parseInt(localStorage.getItem('employerId'));

  // Format salary with commas and currency symbol
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };

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

  // Fetch employer's jobs
  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        setLoading(true);
        // Get company jobs
        const response = await api.getCompanyJobs(employerId);
        
        if (response && response.data) {
          setJobs(response.data);
          
          // If a job ID is specified in the URL, load that job for editing
          if (id) {
            const jobToEdit = response.data.find(job => job.jobId === parseInt(id));
            if (jobToEdit) {
              setSelectedJob(jobToEdit);
              setJobFormData({
                jobTitle: jobToEdit.jobTitle || '',
                description: jobToEdit.description || '',
                location: jobToEdit.location || '',
                salary: jobToEdit.salary || '',
                deadline: jobToEdit.deadline || '',
                requirements: jobToEdit.requirements || '',
                responsibilities: jobToEdit.responsibilities || '',
                benefits: jobToEdit.benefits || ''
              });
              setEditMode(true);
            } else {
              setError('Job not found');
            }
          } else if (isNew) {
            // New job mode
            setEditMode(true);
            setSelectedJob(null);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchEmployerJobs();
  }, [employerId, id, isNew]);

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobFormData({
      ...jobFormData,
      [name]: value
    });
  };

  // Handler for submitting job form (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if employer is verified
    if (verificationStatus !== 'Verified') {
      setError('Your account must be verified before you can post or edit jobs.');
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        ...jobFormData,
        employerId,
        salary: parseInt(jobFormData.salary) || 0,
        status: 'Pending'
      };
      
      if (selectedJob) {
        // Update existing job
        await api.updateJob(selectedJob.jobId, payload);
        setMessage('Job posting updated successfully.');
      } else {
        // Create new job
        const response = await api.createJob(payload);
        setMessage('Job posting created successfully and is pending approval.');
        // Redirect to the job's detail page
        navigate(`/manage-jobs/${response.data.jobId}`);
      }
      
      // Refresh job list
      const response = await api.getCompanyJobs(employerId);
      setJobs(response.data);
      
      setEditMode(false);
      setError('');
    } catch (err) {
      console.error('Error saving job:', err);
      setError('Failed to save job posting. Please check your inputs and try again.');
    }
    
    setLoading(false);
  };

  // Handler to delete a job
  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      try {
        setLoading(true);
        await api.deleteJob(jobId);
        
        // Refresh job list
        const response = await api.getCompanyJobs(employerId);
        setJobs(response.data);
        
        setMessage('Job posting deleted successfully.');
        setError('');
        
        // If the deleted job was the selected one, clear selection
        if (selectedJob && selectedJob.jobId === jobId) {
          setSelectedJob(null);
          setEditMode(false);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error deleting job:', err);
        setError('Failed to delete job posting.');
        setLoading(false);
      }
    }
  };

  // Handler to edit a job
  const handleEditJob = (job) => {
    setSelectedJob(job);
    setJobFormData({
      jobTitle: job.jobTitle || '',
      description: job.description || '',
      location: job.location || '',
      salary: job.salary || '',
      deadline: job.deadline || '',
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      benefits: job.benefits || ''
    });
    setEditMode(true);
  };

  // Handler to cancel editing
  const handleCancelEdit = () => {
    setEditMode(false);
    // If this was a new job form, go back to jobs list
    if (isNew) {
      navigate('/manage-jobs');
    }
  };
  
  // Format date display
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Closed':
        return 'secondary';
      case 'Pending':
        return 'warning';
      default:
        return 'info';
    }
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
  
  // Determine if a job is closed (deadline passed)
  const isJobClosed = (job) => {
    if (job.status === 'Closed') return true;
    if (!job.deadline) return false;
    return calculateDaysRemaining(job.deadline) <= 0;
  };
  
  // Filter jobs by status
  const pendingJobs = jobs.filter(job => job.status === 'Pending');
  const activeJobs = jobs.filter(job => job.status === 'Active' && !isJobClosed(job));
  const closedJobs = jobs.filter(job => job.status === 'Closed' || (job.status === 'Active' && isJobClosed(job)));
  const rejectedJobs = jobs.filter(job => job.status === 'Rejected');
  
  // Check if employer is verified
  const isVerified = verificationStatus === 'Verified';
  const isPending = verificationStatus === 'Pending';
  const isRejected = verificationStatus === 'Rejected';

  if (loading && !editMode) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading jobs...</span>
        </Spinner>
      </Container>
    );
  }

  // Render job form when in edit mode
  if (editMode) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{selectedJob ? 'Edit Job Posting' : 'Create New Job Posting'}</h2>
          <Button variant="outline-secondary" onClick={handleCancelEdit}>
            Cancel
          </Button>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        
        {verificationStatus === 'Pending' && (
          <Alert variant="warning" className="mb-3">
            <Alert.Heading>Account Verification Pending</Alert.Heading>
            <p>
              Your company account is awaiting verification by a moderator. Once verified, you'll be able to post jobs.
              You can prepare this job posting, but you will not be able to submit it until your account is verified.
            </p>
          </Alert>
        )}
        
        {verificationStatus === 'Rejected' && (
          <Alert variant="danger" className="mb-3">
            <Alert.Heading>Account Verification Rejected</Alert.Heading>
            <p>
              Your company verification was rejected. Please update your profile according to the feedback below:
            </p>
            <p className="mb-0"><strong>Feedback:</strong> {verificationFeedback}</p>
            <div className="d-flex justify-content-end mt-2">
              <Button as={Link} to="/company-profile" variant="outline-danger">
                Update Company Profile
              </Button>
            </div>
          </Alert>
        )}
        
        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="jobTitle"
                      value={jobFormData.jobTitle}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={jobFormData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Salary (Annual)</Form.Label>
                    <Form.Control
                      type="number"
                      name="salary"
                      value={jobFormData.salary}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Application Deadline</Form.Label>
                    <Form.Control
                      type="date"
                      name="deadline"
                      value={jobFormData.deadline}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Job Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={jobFormData.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Requirements</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="requirements"
                  value={jobFormData.requirements}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  Enter each requirement on a new line
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Responsibilities</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="responsibilities"
                  value={jobFormData.responsibilities}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  Enter each responsibility on a new line
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Benefits</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="benefits"
                  value={jobFormData.benefits}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  Enter each benefit on a new line
                </Form.Text>
              </Form.Group>
              
              <div className="d-grid mt-4">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    selectedJob ? 'Update Job Posting' : 'Create Job Posting'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Job management view with tabs
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage Job Postings</h2>
        <Button as={Link} to="/manage-jobs/new" variant="primary">
          Post New Job
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      
      <Tabs defaultActiveKey="active" className="mb-4">
        {pendingJobs.length > 0 && (
          <Tab eventKey="pending" title={`Pending Jobs (${pendingJobs.length})`}>
            <ListGroup>
              {pendingJobs.map(job => (
                <ListGroup.Item key={job.jobId} className="border mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5>{job.jobTitle}</h5>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg='warning'>
                          Awaiting Approval
                        </Badge>
                        <Badge bg="secondary">{job.location}</Badge>
                        <Badge bg="secondary">{formatSalary(job.salary)}</Badge>
                      </div>
                    </div>
                    <div>
                      <Button 
                        as={Link} 
                        to={`/manage-jobs/${job.jobId}`} 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteJob(job.jobId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Tab>
        )}
        
        <Tab eventKey="active" title={`Active Jobs (${activeJobs.length})`}>
          <ListGroup>
            {activeJobs.length === 0 ? (
              <Alert variant="info">You don't have any active job postings.</Alert>
            ) : (
              activeJobs.map(job => (
                <ListGroup.Item key={job.jobId} className="border mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5>{job.jobTitle}</h5>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg="success">Active</Badge>
                        <Badge bg="secondary">{job.location}</Badge>
                        <Badge bg="secondary">{formatSalary(job.salary)}</Badge>
                      </div>
                      <small>
                        Deadline: {formatDate(job.deadline)} 
                        ({calculateDaysRemaining(job.deadline)} days remaining)
                      </small>
                    </div>
                    <div>
                      <Button 
                        as={Link} 
                        to={`/manage-jobs/${job.jobId}`} 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteJob(job.jobId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Tab>
        
        <Tab eventKey="closed" title={`Closed Jobs (${closedJobs.length})`}>
          <ListGroup>
            {closedJobs.length === 0 ? (
              <Alert variant="info">You don't have any closed job postings.</Alert>
            ) : (
              closedJobs.map(job => (
                <ListGroup.Item key={job.jobId} className="border mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5>{job.jobTitle}</h5>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg="secondary">Closed</Badge>
                        <Badge bg="secondary">{job.location}</Badge>
                        <Badge bg="secondary">{formatSalary(job.salary)}</Badge>
                      </div>
                      <small>
                        Deadline: {formatDate(job.deadline)} 
                        {calculateDaysRemaining(job.deadline) <= 0 && " (Expired)"}
                      </small>
                    </div>
                    <div>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteJob(job.jobId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Tab>
        
        {rejectedJobs.length > 0 && (
          <Tab eventKey="rejected" title={`Rejected Jobs (${rejectedJobs.length})`}>
            <ListGroup>
              {rejectedJobs.map(job => (
                <ListGroup.Item key={job.jobId} className="border mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5>{job.jobTitle}</h5>
                      <div className="d-flex gap-2 mb-2">
                        <Badge bg="danger">Rejected</Badge>
                        <Badge bg="secondary">{job.location}</Badge>
                        <Badge bg="secondary">{formatSalary(job.salary)}</Badge>
                      </div>
                      {job.feedback && (
                        <Alert variant="danger" className="mt-2 mb-2">
                          <strong>Moderator Feedback:</strong> {job.feedback}
                        </Alert>
                      )}
                      <div className="mt-2">
                        <p className="text-muted small">
                          <i className="bi bi-info-circle me-1"></i>
                          Edit this job posting according to the moderator's feedback and resubmit for approval.
                        </p>
                      </div>
                    </div>
                    <div>
                      <Button 
                        as={Link} 
                        to={`/manage-jobs/${job.jobId}`} 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                      >
                        Edit & Resubmit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => handleDeleteJob(job.jobId)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Tab>
        )}
      </Tabs>
    </Container>
  );
}

export default ManageJobs;
