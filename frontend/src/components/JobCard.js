// Import React and Bootstrap components for UI layout and design
import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Reusable component to display individual job information
function JobCard({ job }) {
  // Get the user's role from localStorage (set at login)
  const userRole = localStorage.getItem('userRole');

  // Format salary with commas and currency symbol
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };
  
  // Calculate days remaining until deadline
  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get badge color based on days remaining
  const getDeadlineBadgeVariant = (daysRemaining) => {
    if (daysRemaining <= 0) return 'danger';
    if (daysRemaining <= 3) return 'warning';
    if (daysRemaining <= 7) return 'info';
    return 'success';
  };
  
  const daysRemaining = job.deadline ? getDaysRemaining(job.deadline) : 0;

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        {/* Job title */}
        <Card.Title>{job.jobTitle}</Card.Title>
        
        {/* Company name */}
        <Card.Subtitle className="mb-2 text-muted">{job.companyName}</Card.Subtitle>

        {/* Job status badge for pending positions */}
        {job.status === 'Pending' && (
          <Badge bg="warning" className="mb-2">Pending Position</Badge>
        )}

        {/* Job brief description - showing only first 120 characters */}
        <Card.Text className="mt-2">
          {job.description.length > 120 
            ? `${job.description.substring(0, 120)}...` 
            : job.description
          }
        </Card.Text>

        {/* Salary information */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <Badge bg="secondary" className="me-2">
            {formatSalary(job.salary)}
          </Badge>
          
          {/* Job location */}
          <small className="text-muted">{job.location}</small>
        </div>
      </Card.Body>

      {/* Footer with Apply button & deadline */}
      <Card.Footer className="bg-white border-top-0 d-flex justify-content-between align-items-center">
        <small className="text-muted">
          {job.status === 'Pending' ? (
            <Badge bg="warning">Awaiting Approval</Badge>
          ) : daysRemaining > 0 ? (
            <>
              <Badge bg={getDeadlineBadgeVariant(daysRemaining)} className="me-1">
                {daysRemaining}d
              </Badge>
              left
            </>
          ) : (
            <Badge bg="danger">Closed</Badge>
          )}
        </small>
        
        <Button 
          as={Link} 
          to={`/jobs/${job.jobId}`} 
          variant="outline-primary" 
          size="sm"
        >
          View Details
        </Button>
      </Card.Footer>
    </Card>
  );
}

export default JobCard;
