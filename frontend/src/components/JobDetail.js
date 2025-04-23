import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, ListGroup, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function JobDetail() {
  const [job, setJob] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  const userRole = localStorage.getItem('userRole');
  const ucid = localStorage.getItem('ucid');

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        
        // Fetch job details
        const jobResponse = await api.getJob(id);
        
        // Map backend data to frontend format if needed
        let jobData = jobResponse.data;
        
        // Check if we need to format backend data
        if (jobData.JobID) {
          const formattedJob = {
            jobId: jobData.JobID,
            employerId: jobData.Employer,
            jobTitle: jobData.JobTitle,
            description: jobData.Description,
            salary: jobData.Salary,
            location: jobData.Location,
            deadline: jobData.Deadline,
            status: jobData.Status || 'Active'
          };
          
          // Fetch employer details to get company name
          try {
            const employerResponse = await api.getEmployer(jobData.Employer);
            setEmployer(employerResponse.data);
            formattedJob.companyName = employerResponse.data.CompanyName;
          } catch (err) {
            console.error("Error fetching employer details:", err);
            formattedJob.companyName = "Company";
          }
          
          jobData = formattedJob;
        }
        
        setJob(jobData);
        
        // Check if user has already applied for this job
        if (userRole === 'student' && ucid) {
          try {
            // Check applications
            const applicationsResponse = await api.getApplications({ 
              applicantUcid: ucid,
              jobId: parseInt(id)
            });
            
            // If any applications exist for this job, user has already applied
            const hasApplied = applicationsResponse.data && 
              applicationsResponse.data.some(app => 
                (app.JobID === parseInt(id) || app.jobId === parseInt(id))
              );
            
            setAlreadyApplied(hasApplied);
            
            // Check if job is saved
            const savedJobResponse = await api.isJobSaved(ucid, parseInt(id));
            setIsSaved(savedJobResponse.data.isSaved);
          } catch (err) {
            console.error("Error checking application status:", err);
            // Continue without setting application status
          }
        }
        
        // Fetch similar jobs (same company or similar salary range)
        const jobsResponse = await api.getJobs();
        const filtered = jobsResponse.data
          .filter(j => j.jobId !== parseInt(id)) // Exclude current job
          .filter(j => j.employerId === jobData.employerId || 
                    Math.abs(j.salary - jobData.salary) < 10000) // Same company or similar salary
          .slice(0, 3); // Limit to 3 jobs
          
        setSimilarJobs(filtered);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching job data:", err);
        setError("Failed to load job details. Please try again later.");
        setLoading(false);
      }
    };

    if (id) {
      fetchJobData();
    }
  }, [id, userRole, ucid]);
  
  // Check verification status if user is a student
  useEffect(() => {
    const checkVerification = async () => {
      if (userRole === 'student' && ucid) {
        try {
          // Check if user is a moderator (moderators are automatically verified)
          const moderatorId = localStorage.getItem('moderatorId');
          if (moderatorId) {
            setVerificationStatus('Verified');
            return;
          }
          
          // For non-moderators, check verification status
          const response = await api.checkVerificationStatus('student', ucid);
          setVerificationStatus(response.data.status);
        } catch (err) {
          console.error("Error checking verification status:", err);
        }
      }
    };
    
    checkVerification();
  }, [userRole, ucid]);
  
  // Determine if user can apply
  const moderatorId = localStorage.getItem('moderatorId');
  const canApply = userRole === 'student' && (verificationStatus === 'Verified' || !!moderatorId);
  
  const handleApply = () => {
    navigate(`/jobs/${id}/apply`);
  };
  
  const handleSaveJob = async () => {
    if (!ucid || userRole !== 'student') return;
    
    try {
      setSavingJob(true);
      
      if (isSaved) {
        // Unsave the job
        await api.unsaveJob(ucid, parseInt(id));
        setIsSaved(false);
      } else {
        // Save the job
        await api.saveJob(ucid, parseInt(id));
        setIsSaved(true);
      }
      
      setSavingJob(false);
    } catch (err) {
      console.error("Error saving/unsaving job:", err);
      setSavingJob(false);
    }
  };
  
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

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading job details...</span>
        </Spinner>
        <p className="mt-2">Loading job details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }
  
  if (!job) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Job not found.</Alert>
        <Button variant="secondary" onClick={() => navigate('/browse')}>
          Browse Jobs
        </Button>
      </Container>
    );
  }
  
  // Get job properties using both frontend and backend field names
  const jobId = job.jobId || job.JobID;
  const jobTitle = job.jobTitle || job.JobTitle;
  const companyName = job.companyName || (employer && employer.CompanyName) || "Company";
  const location = job.location || job.Location;
  const salary = job.salary || job.Salary;
  const deadline = job.deadline || job.Deadline;
  const description = job.description || job.Description;
  const employerId = job.employerId || job.Employer;
  
  const daysRemaining = deadline ? calculateDaysRemaining(deadline) : 0;

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header as="h3" className="bg-primary text-white d-flex justify-content-between align-items-center">
          {jobTitle}
          {userRole === 'employer' && 
           parseInt(localStorage.getItem('employerId')) === parseInt(employerId) && (
            <Button as={Link} to={`/manage-jobs/${jobId}`} variant="light" size="sm">
              Edit Job
            </Button>
          )}
        </Card.Header>
        
        <Card.Body>
          <Row>
            <Col md={8}>
              <h5>{companyName}</h5>
              <p className="mb-2">
                <strong>Location:</strong> {location}
              </p>
              <p className="mb-2">
                <strong>Salary:</strong> {formatSalary(salary)}
              </p>
              <p className="mb-3">
                <strong>Application Deadline:</strong> {new Date(deadline).toLocaleDateString()}
                {daysRemaining > 0 ? (
                  <Badge bg="info" className="ms-2">{daysRemaining} days remaining</Badge>
                ) : (
                  <Badge bg="danger" className="ms-2">Deadline passed</Badge>
                )}
              </p>
              
              <h5 className="mt-4 mb-3">Job Description</h5>
              <div className="job-description" style={{ whiteSpace: 'pre-line' }}>
                {description}
              </div>
            </Col>
            
            <Col md={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="text-center mb-3">Apply for this position</h5>
                  
                  {userRole === 'student' ? (
                    <>
                      {alreadyApplied ? (
                        <Alert variant="info">
                          You have already applied for this position.
                        </Alert>
                      ) : (
                        <>
                          {daysRemaining <= 0 ? (
                            <Alert variant="warning">
                              The application deadline has passed.
                            </Alert>
                          ) : (
                            <div className="d-grid gap-2">
                              <Button 
                                variant="primary" 
                                size="lg" 
                                className="me-2"
                                onClick={handleApply}
                                disabled={!userRole || userRole !== 'student' || !canApply}
                              >
                                {userRole === 'student' && !canApply ? 'Verification Required' : 'Apply Now'}
                              </Button>
                              
                              <Button
                                onClick={handleSaveJob}
                                variant={isSaved ? "outline-danger" : "outline-secondary"}
                                disabled={savingJob}
                              >
                                {savingJob ? (
                                  <Spinner 
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                  />
                                ) : (
                                  <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'} me-2`}></i>
                                )}
                                {isSaved ? 'Unsave Job' : 'Save Job'}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : !userRole ? (
                    <Alert variant="info">
                      Please <Link to="/login">login</Link> to apply for this job.
                    </Alert>
                  ) : (
                    <Alert variant="info">
                      Only students can apply for jobs.
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back to Jobs
        </Button>
      </div>
      
      {/* Similar Jobs Section */}
      {similarJobs.length > 0 && (
        <Row>
          <Col>
            <Card>
              <Card.Header>Similar Jobs You Might Like</Card.Header>
              <ListGroup variant="flush">
                {similarJobs.map((similarJob) => (
                  <ListGroup.Item key={similarJob.jobId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-0">{similarJob.jobTitle}</h6>
                        <small className="text-muted">{similarJob.companyName} • {similarJob.location}</small>
                      </div>
                      <div>
                        <Badge bg="secondary" className="me-2">{formatSalary(similarJob.salary)}</Badge>
                        <Button 
                          as={Link} 
                          to={`/jobs/${similarJob.jobId}`} 
                          variant="outline-primary" 
                          size="sm"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default JobDetail; 