import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import api from '../services/api';

function JobApplicationForm() {
  const { id } = useParams(); // Job ID
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [resume, setResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user account and job title
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [userRes, jobRes] = await Promise.all([
          api.get('/account/', { headers: { Authorization: `Bearer ${token}` } }),
          api.get(`/jobs/${id}/`)
        ]);
        setFirstName(userRes.data.first_name || '');
        setLastName(userRes.data.last_name || '');
        setJobTitle(jobRes.data.title);
        setLoading(false);
      } catch (err) {
        console.error('Error loading application form:', err);
        setError('Failed to load form data.');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('job', id);
      formData.append('cover_letter', coverLetter);
      formData.append('phone', phone);
      if (resume) formData.append('resume', resume);

      await api.post('/applications/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setMessage('Application submitted successfully!');
      setError('');
      setTimeout(() => navigate('/browse'), 1500);
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Application failed. Please try again.');
      setMessage('');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <Card.Body>
          <h3 className="mb-4 text-center">Apply to: {jobTitle}</h3>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            {/* Job Title (readonly) */}
            <Form.Group className="mb-3">
              <Form.Label>Job Title</Form.Label>
              <Form.Control type="text" value={jobTitle} disabled />
            </Form.Group>

            {/* Applicant First Name (readonly) */}
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="text" value={firstName} disabled />
            </Form.Group>

            {/* Applicant Last Name (readonly) */}
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="text" value={lastName} disabled />
            </Form.Group>

            {/* Phone Number */}
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="e.g., 403-123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Form.Group>

            {/* Resume Upload */}
            <Form.Group className="mb-3">
              <Form.Label>Upload Resume (PDF only)</Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={(e) => setResume(e.target.files[0])}
              />
            </Form.Group>

            {/* Optional Cover Letter */}
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter (optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                placeholder="Write your cover letter here..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit">Submit Application</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default JobApplicationForm;
