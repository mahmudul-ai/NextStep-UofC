// src/components/JobCard.js
import React from 'react';
import { Card, Button } from 'react-bootstrap';

function JobCard({ job }) {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title>{job.title}</Card.Title>
        <Card.Text>{job.description}</Card.Text>
        <Card.Text>
          <small className="text-muted">Location: {job.location}</small>
        </Card.Text>
      </Card.Body>
      <Card.Footer className="bg-white border-top-0">
        <Button variant="primary" size="sm">Apply Now</Button>
      </Card.Footer>
    </Card>
  );
}

export default JobCard;
