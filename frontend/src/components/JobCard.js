// Import React and Bootstrap components for UI layout and design
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // Used for programmatic navigation

// Reusable component to display individual job information
function JobCard({ job }) {
  // Get the user's role from localStorage (set at login)
  const userRole = localStorage.getItem('userRole');

  // Hook to navigate to the application form page
  const navigate = useNavigate();

  // Handle Apply button click
  const handleApply = () => {
    // Restrict job applications to job seekers only
    if (userRole !== 'job_seeker') {
      alert('Only job seekers can apply to jobs.');
      return;
    }

    // Redirect to the application form for this job
    navigate(`/jobs/${job.id}/apply`);
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {/* Job title */}
        <Card.Title>{job.title}</Card.Title>

        {/* Job description */}
        <Card.Text>{job.description}</Card.Text>

        {/* Job location info */}
        <Card.Text>
          <small className="text-muted">Location: {job.location}</small>
        </Card.Text>
      </Card.Body>

      {/* Footer with Apply button */}
      <Card.Footer className="bg-white border-top-0">
        <Button variant="primary" size="sm" onClick={handleApply}>
          Apply Now
        </Button>
      </Card.Footer>
    </Card>
  );
}

export default JobCard;
