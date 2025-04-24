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

  // Format salary with commas and currency symbol with improved validation
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
        
        // Ensure we have a valid employer ID
        if (!employerId) {
          console.error('No employer ID found in localStorage');
          setError('Your employer account information could not be found. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log('Fetching jobs for employer ID:', employerId);
        
        // Get company jobs - don't filter by status to get ALL jobs
        const response = await api.getCompanyJobs(employerId);
        
        if (response && response.data) {
          console.log('Fetched jobs:', response.data);
          
          // Ensure consistent job status field and format with improved validation
          const formattedJobs = response.data.map(job => {
            // Debug logging for troubleshooting
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
            
            const formattedJob = {
              jobId: job.JobID || job.jobId,
              employerId: job.Employer || job.employerId,
              jobTitle: job.JobTitle || job.jobTitle,
              description: job.Description || job.description,
              location: job.Location || job.location,
              salary: parsedSalary,
              deadline: validDeadline,
              requirements: job.Requirements || job.requirements,
              responsibilities: job.Responsibilities || job.responsibilities,
              benefits: job.Benefits || job.benefits,
              feedback: job.feedback || job.Feedback || '',
              status: job.Status || job.status || 'Pending'
            };
            
            // Check if deadline has passed and it's still active
            if (formattedJob.status === 'Active' && 
                formattedJob.deadline && 
                new Date(formattedJob.deadline) < new Date()) {
              console.log(`Job ${formattedJob.jobId} deadline has passed, marking as Closed`);
              formattedJob.status = 'Closed';
            }
            
            return formattedJob;
          });
          
          console.log('Formatted jobs for display:', formattedJobs);
          
          // Double-check that all jobs belong to this employer
          const filteredJobs = formattedJobs.filter(job => {
            const jobEmployerId = parseInt(job.employerId);
            const isOwner = jobEmployerId === employerId;
            if (!isOwner) {
              console.warn(`Job ${job.jobId} has employerId ${jobEmployerId} which doesn't match current employer ${employerId}`);
            }
            return isOwner;
          });
          
          if (filteredJobs.length !== formattedJobs.length) {
            console.warn(`Filtered out ${formattedJobs.length - filteredJobs.length} jobs that didn't belong to this employer`);
          }
          
          setJobs(filteredJobs);
          
          // If a job ID is specified in the URL, load that job for editing
          if (id) {
            const jobToEdit = filteredJobs.find(job => job.jobId === parseInt(id));
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
        } else {
          console.log('No jobs found or invalid response format');
          setJobs([]);
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
      // Validate and parse salary
      let parsedSalary;
      try {
        parsedSalary = parseInt(jobFormData.salary);
        if (isNaN(parsedSalary)) parsedSalary = 0;
      } catch (err) {
        parsedSalary = 0;
      }
      
      const payload = {
        ...jobFormData,
        employerId,
        salary: parsedSalary,
        status: 'Active'
      };
      
      if (selectedJob) {
        // Update existing job
        await api.updateJob(selectedJob.jobId, payload);
        setMessage('Job posting updated successfully.');
      } else {
        // Create new job
        const response = await api.createJob(payload);
        setMessage('Job posting created successfully.');
        // Redirect to the job's detail page
        navigate(`/manage-jobs/${response.data.jobId}`);
      }
      
      // Refresh job list
      const response = await api.getCompanyJobs(employerId);
      
      // Process the response with the same validation as in fetchEmployerJobs
      const formattedJobs = response.data.map(job => {
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
          description: job.Description || job.description,
          location: job.Location || job.location,
          salary: parsedSalary,
          deadline: validDeadline,
          requirements: job.Requirements || job.requirements,
          responsibilities: job.Responsibilities || job.responsibilities,
          benefits: job.Benefits || job.benefits,
          feedback: job.feedback || job.Feedback || '',
          status: job.Status || job.status || 'Pending'
        };
      });
      
      setJobs(formattedJobs);
      
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
        
        // Process the response with the same validation as in fetchEmployerJobs
        const formattedJobs = response.data.map(job => {
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
            description: job.Description || job.description,
            location: job.Location || job.location,
            salary: parsedSalary,
            deadline: validDeadline,
            requirements: job.Requirements || job.requirements,
            responsibilities: job.Responsibilities || job.responsibilities,
            benefits: job.Benefits || job.benefits,
            feedback: job.feedback || job.Feedback || '',
            status: job.Status || job.status || 'Pending'
          };
        });
        
        setJobs(formattedJobs);
        
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

  // Handler to close a job
  const handleCloseJob = async (jobId) => {
    if (window.confirm('Are you sure you want to close this job posting? This will remove it from active job searches.')) {
      try {
        setLoading(true);
        
        // Get the job to update
        const jobToClose = jobs.find(job => job.jobId === jobId);
        if (!jobToClose) {
          throw new Error('Job not found');
        }
        
        // Update with closed status
        const payload = {
          ...jobToClose,
          employerId,
          status: 'Closed'
        };
        
        await api.updateJob(jobId, payload);
        
        // Refresh job list
        const response = await api.getCompanyJobs(employerId);
        setJobs(response.data);
        
        setMessage('Job posting closed successfully.');
        setError('');
        setLoading(false);
      } catch (err) {
        console.error('Error closing job:', err);
        setError('Failed to close job posting.');
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
  
  // Format date display with improved validation
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
  
  // Check if job is closed
  const isJobClosed = (job) => {
    if (job.status === 'Closed') return true;
    if (!job.deadline) return false;
    return calculateDaysRemaining(job.deadline) <= 0;
  };
  
  // Consolidate jobs into two main categories: Open and Closed
  
  // Closed jobs are those with "Closed" status OR past deadline
  const closedJobs = jobs.filter(job => {
    if (job.status === 'Closed') return true;
    if (job.status === 'Active' && isJobClosed(job)) return true;
    return false;
  });
  
  // Open jobs are all Active jobs that aren't closed
  const openJobs = jobs.filter(job => !closedJobs.includes(job));
  
  console.log('Job status counts:', {
    open: openJobs.length,
    closed: closedJobs.length,
    total: jobs.length
  });
  
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
        <Button as={Link} to="/create-job" variant="primary">
          Post New Job
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      
      {jobs.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">Job Status Overview</h5>
                <Row>
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <div className="bg-success me-3" style={{ width: '10px', height: '40px', borderRadius: '3px' }}></div>
                      <div>
                        <div className="h3 mb-0">{openJobs.length}</div>
                        <div className="text-muted">Open</div>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary me-3" style={{ width: '10px', height: '40px', borderRadius: '3px' }}></div>
                      <div>
                        <div className="h3 mb-0">{closedJobs.length}</div>
                        <div className="text-muted">Closed</div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      {jobs.length === 0 && !error && (
        <Alert variant="info" className="text-center">
          <h5>No Job Postings Yet</h5>
          <p>Create your first job posting to start recruiting.</p>
          <Button as={Link} to="/create-job" variant="primary">
            Create Job Posting
          </Button>
        </Alert>
      )}
      
      {jobs.length > 0 && (
        <Tabs defaultActiveKey="open" className="mb-4 nav-fill">
          <Tab eventKey="open" title={
            <div className="d-flex align-items-center">
              <span className="badge bg-success me-2">{openJobs.length}</span>
              <span>Open</span>
            </div>
          }>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <ListGroup>
                  {openJobs.length === 0 ? (
                    <Alert variant="info">You don't have any open job postings.</Alert>
                  ) : (
                    openJobs.map(job => (
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
                              {job.deadline && calculateDaysRemaining(job.deadline) > 0 ? 
                                ` (${calculateDaysRemaining(job.deadline)} days remaining)` : 
                                ''}
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
                              variant="outline-secondary" 
                              size="sm" 
                              onClick={() => handleCloseJob(job.jobId)}
                              className="me-2"
                            >
                              <i className="bi bi-x-circle me-1"></i>
                              Close
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
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="closed" title={
            <div className="d-flex align-items-center">
              <span className="badge bg-secondary me-2">{closedJobs.length}</span>
              <span>Closed</span>
            </div>
          }>
            <Card className="border-0 shadow-sm">
              <Card.Body>
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
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}
    </Container>
  );
}

export default ManageJobs;
