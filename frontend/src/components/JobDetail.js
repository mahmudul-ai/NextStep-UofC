import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, ListGroup, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function JobDetail() {
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  
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
        setJob(jobResponse.data);
        
        // Check if user has already applied for this job
        if (userRole === 'student' && ucid) {
          // Check applications
          const applicationsResponse = await api.getApplications({ applicantUcid: ucid });
          const hasApplied = applicationsResponse.data.some(app => app.jobId === parseInt(id));
          setAlreadyApplied(hasApplied);
          
          // Check if job is saved
          const savedJobResponse = await api.isJobSaved(ucid, parseInt(id));
          setIsSaved(savedJobResponse.data.isSaved);
        }
        
        // Fetch similar jobs (same company or similar salary range)
        const jobsResponse = await api.getJobs();
        const filtered = jobsResponse.data
          .filter(j => j.jobId !== parseInt(id)) // Exclude current job
          .filter(j => j.employerId === jobResponse.data.employerId || 
                    Math.abs(j.salary - jobResponse.data.salary) < 10000) // Same company or similar salary
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
    return <div className="text-center p-5">Loading job details...</div>;
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }
  
  const daysRemaining = job?.deadline ? calculateDaysRemaining(job.deadline) : 0;

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">{job?.jobTitle}</h3>
                {userRole === 'employer' && job?.employerId === parseInt(localStorage.getItem('employerId')) && (
                  <Button as={Link} to={`/manage-jobs/${id}/edit`} variant="light" size="sm">
                    Edit Job
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h5 className="mb-3">Company: {job?.companyName}</h5>
                  <p className="mb-3"><strong>Location:</strong> {job?.location}</p>
                  <p className="mb-3"><strong>Salary:</strong> {formatSalary(job?.salary)}</p>
                  <p className="mb-3">
                    <strong>Application Deadline:</strong> {job?.deadline} 
                    {daysRemaining > 0 && (
                      <Badge bg="warning" className="ms-2">{daysRemaining} days remaining</Badge>
                    )}
                    {daysRemaining <= 0 && (
                      <Badge bg="danger" className="ms-2">Deadline passed</Badge>
                    )}
                  </p>
                  
                  <h5 className="mt-4 mb-3">Job Description</h5>
                  <div className="job-description" style={{ whiteSpace: 'pre-line' }}>
                    {job?.description}
                  </div>
                </Col>
                
                <Col md={4}>
                  <Card className="mb-4 shadow-sm">
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
                                <div className="d-grid">
                                  <Button 
                                    onClick={handleApply} 
                                    variant="primary" 
                                    size="lg"
                                    className="mb-2"
                                  >
                                    Apply Now
                                  </Button>
                                  
                                  <Button
                                    onClick={handleSaveJob}
                                    variant={isSaved ? "outline-secondary" : "outline-primary"}
                                    disabled={savingJob}
                                  >
                                    {savingJob ? (
                                      <>
                                        <Spinner
                                          as="span"
                                          animation="border"
                                          size="sm"
                                          role="status"
                                          aria-hidden="true"
                                          className="me-2"
                                        />
                                        {isSaved ? "Unsaving..." : "Saving..."}
                                      </>
                                    ) : (
                                      <>
                                        <i className={`bi ${isSaved ? "bi-bookmark-fill" : "bi-bookmark"} me-2`}></i>
                                        {isSaved ? "Saved" : "Save Job"}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <Alert variant="info">
                          You need to be logged in as a student to apply for jobs.
                        </Alert>
                      )}
                    </Card.Body>
                  </Card>
                  
                  <Card className="company-card shadow-sm">
                    <Card.Body>
                      <h5>About {job?.companyName}</h5>
                      <p>
                        More information about the company would go here.
                        For now, check out other jobs from this employer.
                      </p>
                      <Button 
                        as={Link} 
                        to={`/browse?employer=${job?.employerId}`} 
                        variant="outline-primary" 
                        className="w-100"
                      >
                        See All Jobs from This Employer
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
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