import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateJobPosting() {
  const navigate = useNavigate();
  const employerId = parseInt(localStorage.getItem('employerId'));
  const userRole = localStorage.getItem('userRole');
  
  // State for form data and UI states
  const [jobForm, setJobForm] = useState({
    jobTitle: '',
    description: '',
    location: '',
    salary: '',
    deadline: '',
    requirements: '',
    responsibilities: '',
    benefits: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  // Redirect if not logged in as employer
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
      } catch (err) {
        console.error("Error checking verification status:", err);
      }
    };
    
    if (employerId) {
      checkVerification();
    }
  }, [employerId]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobForm({
      ...jobForm,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if employer is verified
    if (verificationStatus !== 'Verified') {
      setError('Your account must be verified before you can post jobs.');
      return;
    }
    
    // Validate input
    if (!jobForm.jobTitle || !jobForm.description || !jobForm.location || !jobForm.salary || !jobForm.deadline) {
      setError('Please fill out all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const jobData = {
        employerId,
        jobTitle: jobForm.jobTitle,
        description: jobForm.description,
        location: jobForm.location,
        salary: parseInt(jobForm.salary) || 0,
        deadline: jobForm.deadline,
        requirements: jobForm.requirements,
        responsibilities: jobForm.responsibilities,
        benefits: jobForm.benefits,
        status: 'Pending' // All new jobs start as pending and need moderator approval
      };
      
      const response = await api.createJob(jobData);
      
      setMessage('Job posting created successfully and is pending approval.');
      setLoading(false);
      
      // Reset form
      setJobForm({
        jobTitle: '',
        description: '',
        location: '',
        salary: '',
        deadline: '',
        requirements: '',
        responsibilities: '',
        benefits: ''
      });
      
      // Redirect to manage jobs page after a short delay
      setTimeout(() => {
        navigate('/manage-jobs');
      }, 2000);
    } catch (err) {
      console.error('Error creating job posting:', err);
      let errorMessage = 'Failed to create job posting.';
      
      // Handle specific error cases
      if (err.response) {
        if (err.response.status === 500 && err.response.data && err.response.data.includes('duplicate key')) {
          errorMessage = 'There was a database error with duplicate keys. Please try again.';
        } else if (err.response.data && err.response.data.detail) {
          errorMessage = `Error: ${err.response.data.detail}`;
        } else if (typeof err.response.data === 'string') {
          errorMessage = `Error: ${err.response.data}`;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Set today as the min date for the deadline
  const today = new Date().toISOString().split('T')[0];

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header as="h3">Create New Job Posting</Card.Header>
            <Card.Body>
              {verificationStatus !== 'Verified' && (
                <Alert variant="warning">
                  Your employer account must be verified before you can post jobs. 
                  Please complete verification to continue.
                </Alert>
              )}
              
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="jobTitle"
                    value={jobForm.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={jobForm.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Calgary, AB or Remote"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Salary (Annual) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="salary"
                    value={jobForm.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., 75000"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Application Deadline <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="deadline"
                    value={jobForm.deadline}
                    onChange={handleInputChange}
                    min={today}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Job Description <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={jobForm.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of the job role..."
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Requirements</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="requirements"
                    value={jobForm.requirements}
                    onChange={handleInputChange}
                    placeholder="Education, skills, experience required..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Responsibilities</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="responsibilities"
                    value={jobForm.responsibilities}
                    onChange={handleInputChange}
                    placeholder="Key responsibilities and duties..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Benefits</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="benefits"
                    value={jobForm.benefits}
                    onChange={handleInputChange}
                    placeholder="Healthcare, vacation, work environment..."
                  />
                </Form.Group>
                
                <div className="d-flex gap-2 mt-4">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading || verificationStatus !== 'Verified'}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        <span className="ms-2">Creating...</span>
                      </>
                    ) : (
                      'Create Job Posting'
                    )}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/manage-jobs')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default CreateJobPosting; 