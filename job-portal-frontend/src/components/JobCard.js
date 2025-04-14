// Import React and Bootstrap components used for styling
import React from 'react';
import { Card, Button } from 'react-bootstrap';

// JobCard component takes a single job object as a prop and displays its info
function JobCard({ job }) {
  return (
    <Card className="shadow-sm"> {/* Bootstrap card with slight shadow */}
      <Card.Body>
        {/* Job title as the main heading */}
        <Card.Title>{job.title}</Card.Title>

        {/* Job description text */}
        <Card.Text>{job.description}</Card.Text>

        {/* Job location shown in smaller, muted text */}
        <Card.Text>
          <small className="text-muted">Location: {job.location}</small>
        </Card.Text>
      </Card.Body>

      {/* Footer section with an "Apply Now" button (functionality can be added later) */}
      <Card.Footer className="bg-white border-top-0">
        <Button variant="primary" size="sm">Apply Now</Button>
      </Card.Footer>
    </Card>
  );
}

export default JobCard;
