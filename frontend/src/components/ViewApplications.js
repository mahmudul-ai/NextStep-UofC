import React, { useEffect, useState } from 'react';
import { Container, Card, Row, Col, Button, Badge } from 'react-bootstrap';
import api from '../services/api';

function ViewApplications() {
  const [applications, setApplications] = useState([]);
  const recruiterUsername = localStorage.getItem('username');

  // Define fetchApplications OUTSIDE so it's reusable
  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/');
      setApplications(response.data);
    } catch (err) {
      console.error('Error loading applications:', err);
    }
  };

  // useEffect calls fetchApplications on mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Approve or Reject with a popup
  const handleAction = async (id, actionType) => {
    try {
      await api.post(`/applications/${id}/${actionType}/`);
      alert(`✅ ${actionType === 'approve' ? 'Approval' : 'Rejection'} email sent to job seeker.`);
      fetchApplications(); // Refresh after action
    } catch (err) {
      console.error(err);
      alert('❌ Failed to process application.');
    }
  };

  return (
    <Container className="py-5">
      <h2 className="mb-4">Job Applications</h2>

      {applications.length === 0 ? (
        <p>No applications found for your jobs.</p>
      ) : (
        <Row className="g-4">
          {applications.map((app) => (
            <Col key={app.id} xs={12} md={6} lg={4}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title>{app.applicant.username}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Job: {app.job.title}
                  </Card.Subtitle>
                  <Card.Text>
                    <strong>Cover Letter:</strong><br />
                    {app.cover_letter || <i>No cover letter</i>}
                  </Card.Text>
                  <Card.Text>
                    <strong>Status:</strong>{' '}
                    <Badge bg={
                      app.status === 'pending' ? 'secondary' :
                      app.status === 'approved' ? 'success' :
                      'danger'
                    }>
                      {app.status.toUpperCase()}
                    </Badge>
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleAction(app.id, 'approve')}
                      disabled={app.status !== 'pending'}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleAction(app.id, 'reject')}
                      disabled={app.status !== 'pending'}
                    >
                      Reject
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default ViewApplications;
