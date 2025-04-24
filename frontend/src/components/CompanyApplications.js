import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Alert, Spinner, Form, Modal, Accordion } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function CompanyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobListings, setJobListings] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState(null);
  
  const navigate = useNavigate();
  const employerId = localStorage.getItem('employerId');
  const userRole = localStorage.getItem('userRole');
  
  // Check if user is authorized
  useEffect(() => {
    if (!employerId || userRole !== 'employer') {
      navigate('/login');
    }
  }, [employerId, userRole, navigate]);
  
  // Fetch applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get all job listings for this employer
        const jobsResponse = await api.getCompanyJobs(employerId);
        
        // Normalize job data and ensure we only include this employer's jobs
        const normalizedJobs = jobsResponse.data
          .filter(job => {
            const jobEmployerId = job.Employer || job.EmployerID || job.employerId || job.employer;
            // Use loose equality to handle string/number differences
            return jobEmployerId == employerId;
          })
          .map(job => ({
            jobId: job.JobID || job.jobId,
            jobTitle: job.JobTitle || job.jobTitle,
            description: job.Description || job.description,
            salary: job.Salary || job.salary,
            location: job.Location || job.location,
            deadline: job.Deadline || job.deadline,
            employerId: job.Employer || job.EmployerID || job.employerId || job.employer,
            status: job.Status || job.status || "Open" // Default to Open if status not provided
          }));
        
        setJobListings(normalizedJobs);
        
        // Get all applications for this employer's jobs
        const applicationsResponse = await api.getCompanyApplications(employerId);
        
        // Normalize data and filter to only include applications for this employer's jobs
        const normalizedApplications = applicationsResponse.data
          .filter(app => {
            const appEmployerId = app.EmployerID || app.employerId;
            // Only include applications where the employer ID matches the current user
            return appEmployerId == employerId;
          })
          .map(app => ({
            applicationId: app.ApplicationID || app.applicationId,
            status: app.Status || app.status,
            dateApplied: app.DateApplied || app.dateApplied,
            applicantUcid: app.ApplicantUCID || app.applicantUcid,
            jobId: app.JobID || app.jobId,
            employerId: app.EmployerID || app.employerId,
            // Student info may not be included in the initial response
            student: app.student || {
              name: "Applicant #" + (app.ApplicantUCID || app.applicantUcid),
              ucid: app.ApplicantUCID || app.applicantUcid,
              email: "Loading...",
              phone: "Loading...",
              major: "Loading..."
            }
          }));
        
        // Get the list of job IDs that belong to this employer
        const employerJobIds = normalizedJobs.map(job => job.jobId);
        
        // Final filter to ensure we only process applications for this employer's jobs
        const filteredApplications = normalizedApplications.filter(app => 
          employerJobIds.includes(app.jobId)
        );
        
        setApplications(filteredApplications);
        
        // Fetch student details for each application
        if (filteredApplications.length > 0) {
          const applicationsWithStudents = await Promise.all(
            filteredApplications.map(async (app) => {
              // Skip if student details are already included
              if (app.student && app.student.name && app.student.name !== "Applicant #" + app.applicantUcid) {
                return app;
              }
              
              try {
                const studentResponse = await api.getStudentProfile(app.applicantUcid);
                const studentData = studentResponse.data;
                
                return {
                  ...app,
                  student: {
                    name: `${studentData.FName || ''} ${studentData.LName || ''}`.trim() || `Applicant #${app.applicantUcid}`,
                    ucid: app.applicantUcid,
                    email: studentData.Email || '',
                    phone: studentData.Phone || studentData.phone || 'Not provided',
                    major: studentData.Major || 'Not specified'
                  }
                };
              } catch (err) {
                console.error(`Error fetching student details for application ${app.applicationId}:`, err);
                return app;
              }
            })
          );
          
          setApplications(applicationsWithStudents);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load applications. Please try again later.");
        setLoading(false);
      }
    };
    
    if (employerId) {
      fetchData();
    }
  }, [employerId]);
  
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
      case 'offer':
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
      case 'submitted':
        return 'Submitted';
      case 'under review':
        return 'Under Review';
      case 'interview':
        return 'Interview';
      case 'rejected':
        return 'Rejected';
      case 'offer':
        return 'Offer';
      case 'accepted':
        return 'Accepted';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  // Filter applications based on search
  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.job?.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Open status modal
  const handleOpenStatusModal = (application, initialStatus) => {
    // Find the job information if not already present in the application
    if (!application.job && application.jobId) {
      // Find the job in the jobListings
      const jobInfo = jobListings.find(job => job.jobId == application.jobId);
      
      // Add job information to the application
      application = {
        ...application,
        job: jobInfo || {
          // Fallback job info if not found
          jobId: application.jobId,
          jobTitle: `Job #${application.jobId}`,
          status: 'Unknown'
        }
      };
    }
    
    setCurrentApplication(application);
    setNewStatus(initialStatus || application.status);
    setShowStatusModal(true);
  };
  
  // Handle status update
  const handleUpdateStatus = async () => {
    if (!currentApplication) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update application status (no feedback)
      await api.updateApplicationStatus(
        currentApplication.applicationId, 
        newStatus
      );
      
      // Update local state
      const updatedApplications = applications.map(app => {
        if (app.applicationId === currentApplication.applicationId) {
          return { 
            ...app, 
            status: newStatus,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return app;
      });
      
      setApplications(updatedApplications);
      setShowStatusModal(false);
      setUpdatingStatus(false);
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update application status. Please try again.");
      setUpdatingStatus(false);
    }
  };

  // Group applications by job
  const applicationsByJob = {};
  
  // Organize applications by job - only including this employer's jobs
  if (jobListings.length > 0) {
    jobListings.forEach(job => {
      // Ensure this job belongs to the current employer 
      const jobEmployerId = job.employerId || job.Employer || job.EmployerID || job.employer;
      if (jobEmployerId != employerId) {
        return; // Skip jobs that don't belong to this employer
      }
      
      // Find all applications for this job
      const jobApplications = filteredApplications.filter(app => {
        // Match by jobId, handling both formats
        const appJobId = app.jobId || app.JobID;
        const thisJobId = job.jobId || job.JobID;
        return appJobId == thisJobId; // Use loose equality for string/number comparison
      });
      
      // Include jobs that have applications or are open (default to showing all jobs)
      const jobStatus = (job.status || '').toLowerCase();
      const isOpen = jobStatus === '' || jobStatus === 'open' || jobStatus.includes('active');
      
      // Always include this employer's jobs
      // For jobs without proper titles
      const jobTitle = job.jobTitle || job.JobTitle || `Job #${job.jobId || job.JobID}`;
      
      applicationsByJob[job.jobId] = {
        job: {
          ...job,
          jobTitle // Ensure job title is displayed properly
        },
        applications: jobApplications
      };
    });
  }
  
  // Add any applications for jobs not in the job listings
  const jobIdsInListing = jobListings.map(job => job.jobId || job.JobID);
  
  filteredApplications
    .filter(app => {
      const appJobId = app.jobId || app.JobID;
      return !jobIdsInListing.includes(appJobId);
    })
    .forEach(app => {
      const appJobId = app.jobId || app.JobID;
      if (!applicationsByJob[appJobId]) {
        applicationsByJob[appJobId] = {
          job: {
            jobId: appJobId,
            jobTitle: app.job?.jobTitle || `Job #${appJobId}`,
            status: 'Unknown'
          },
          applications: []
        };
      }
      applicationsByJob[appJobId].applications.push(app);
    });
  
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
          <h2>Manage Applications</h2>
          <p className="text-muted">Review and respond to applications received for your job postings</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/employer-dashboard" variant="outline-primary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>
      
      {/* Error alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Search */}
      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by applicant name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
      </Card>
      
      {/* Empty state */}
      {Object.keys(applicationsByJob).length === 0 && !loading && (
        <Alert variant="info">
          You haven't received any applications yet. Make sure your job listings are active and visible.
          <div className="mt-3">
            <Button as={Link} to="/post-job" variant="primary">Post a New Job</Button>
          </div>
        </Alert>
      )}
      
      {/* Jobs with applications */}
      {Object.keys(applicationsByJob).length > 0 && (
        <Accordion defaultActiveKey={expandedJobId} className="mb-4">
          {Object.values(applicationsByJob).map(({ job, applications }) => (
            <Accordion.Item key={job.jobId} eventKey={job.jobId.toString()}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                  <div>
                    <h5 className="mb-0">{job.jobTitle}</h5>
                    <p className="text-muted small mb-0">
                      {applications.length === 0 ? 'No applications' : 
                       `${applications.length} application${applications.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <Badge bg={job.status?.toLowerCase() === 'open' ? 'success' : 'secondary'}>
                    {job.status || 'Status Unknown'}
                  </Badge>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {applications.length === 0 ? (
                  <Alert variant="info">
                    No applications received for this job posting yet.
                  </Alert>
                ) : (
                  <ListGroup variant="flush">
                    {applications.map((application) => (
                      <ListGroup.Item key={application.applicationId} className="py-3">
                        <Row>
                          <Col md={7}>
                            <h6 className="mb-1">{application.student.name}</h6>
                            <p className="mb-1 text-muted small">
                              <strong>Email:</strong> {application.student.email}<br />
                              <strong>Phone:</strong> {application.student.phone}<br />
                              <strong>Major:</strong> {application.student.major || 'Not specified'}
                            </p>
                            <div>
                              <Badge bg={getStatusBadgeVariant(application.status)} className="me-2">
                                {formatStatus(application.status)}
                              </Badge>
                              <small className="text-muted">
                                Applied on: {new Date(application.dateApplied).toLocaleDateString()}
                              </small>
                            </div>
                          </Col>
                          <Col md={5} className="d-flex justify-content-end align-items-center">
                            {application.resumeUrl && (
                              <Button
                                onClick={() => window.open(`/resumes/${application.resumeUrl}`, '_blank')}
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                              >
                                View Resume
                              </Button>
                            )}
                            
                            {application.status.toLowerCase() === 'submitted' && (
                              <div className="d-flex">
                                <Button 
                                  onClick={() => handleOpenStatusModal(application, 'under review')}
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                >
                                  Review
                                </Button>
                              </div>
                            )}
                            
                            {application.status.toLowerCase() === 'under review' && (
                              <div className="d-flex">
                                <Button 
                                  onClick={() => handleOpenStatusModal(application, 'interview')}
                                  variant="outline-primary"
                                  size="sm"
                                  className="me-2"
                                >
                                  Interview
                                </Button>
                                <Button 
                                  onClick={() => handleOpenStatusModal(application, 'rejected')}
                                  variant="outline-danger"
                                  size="sm"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            
                            {application.status.toLowerCase() === 'interview' && (
                              <div className="d-flex">
                                <Button 
                                  onClick={() => handleOpenStatusModal(application, 'offer')}
                                  variant="outline-success"
                                  size="sm"
                                  className="me-2"
                                >
                                  Offer
                                </Button>
                                <Button 
                                  onClick={() => handleOpenStatusModal(application, 'rejected')}
                                  variant="outline-danger"
                                  size="sm"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            
                            {['rejected', 'offer', 'accepted'].includes(application.status.toLowerCase()) && (
                              <Button 
                                onClick={() => handleOpenStatusModal(application)}
                                variant="outline-secondary"
                                size="sm"
                              >
                                Update
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
      
      {/* Status Update Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Change Status to {formatStatus(newStatus)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentApplication && (
            <>
              <h5 className="mb-3">Applicant Information</h5>
              <Card className="mb-3">
                <Card.Body>
                  <p className="mb-1"><strong>Name:</strong> {currentApplication.student?.name || `Applicant #${currentApplication.applicantUcid}`}</p>
                  <p className="mb-1"><strong>Email:</strong> {currentApplication.student?.email || 'Not provided'}</p>
                  <p className="mb-1"><strong>Phone:</strong> {currentApplication.student?.phone || 'Not provided'}</p>
                  <p className="mb-1"><strong>Major:</strong> {currentApplication.student?.major || 'Not specified'}</p>
                  <p className="mb-0"><strong>UCID:</strong> {currentApplication.applicantUcid}</p>
                </Card.Body>
              </Card>
              
              <h5 className="mb-3">Job Information</h5>
              <Card className="mb-3">
                <Card.Body>
                  <p className="mb-1"><strong>Position:</strong> {currentApplication.job?.jobTitle || `Job #${currentApplication.jobId}`}</p>
                  <p className="mb-1"><strong>Location:</strong> {currentApplication.job?.location || 'Not specified'}</p>
                  <p className="mb-0"><strong>Current Status:</strong> {formatStatus(currentApplication.status)}</p>
                </Card.Body>
              </Card>
              
              <Form.Group className="mb-3">
                <Form.Label>Update Application Status</Form.Label>
                <Form.Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="submitted">Submitted</option>
                  <option value="under review">Under Review</option>
                  <option value="interview">Interview</option>
                  <option value="rejected">Rejected</option>
                  <option value="offer">Offer</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={updatingStatus}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default CompanyApplications; 