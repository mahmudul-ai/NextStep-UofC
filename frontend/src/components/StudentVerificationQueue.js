import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

function StudentVerificationQueue() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState('Verified');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  // Fetch verification queue data
  useEffect(() => {
    const fetchVerificationData = async () => {
      try {
        setLoading(true);
        // Use the correct API endpoint for student verifications
        const response = await api.getStudentVerificationQueue();
        
        // Map the response data to match the component's expected format
        const formattedData = response.data.map(verification => ({
          vid: verification.ID || verification.id,
          applicantUcid: verification.ApplicantID || verification.applicantId,
          status: verification.VerificationStatus || verification.status,
          date: verification.Date || verification.date,
          student: {
            name: `${verification.student?.FName || verification.student?.FirstName || ''} ${verification.student?.LName || verification.student?.LastName || ''}`.trim(),
            email: verification.student?.Email || verification.student?.email,
            major: verification.student?.Major || verification.student?.major,
            graduationYear: verification.student?.GraduationYear || verification.student?.graduationYear
          }
        }));
        
        setVerifications(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching verification data:", err);
        setError("Failed to load verification queue. Please try again later.");
        setLoading(false);
      }
    };

    fetchVerificationData();
  }, []);

  // Handle opening the verification modal
  const handleVerify = (verification) => {
    setSelectedVerification(verification);
    setVerificationStatus('Verified');
    setVerificationNotes('');
    setShowModal(true);
  };

  // Handle submitting verification decision
  const handleSubmitVerification = async () => {
    try {
      setVerificationInProgress(true);
      
      // Call API to update verification status
      await api.verifyStudent(
        selectedVerification.applicantUcid, 
        verificationStatus,
        verificationNotes
      );
      
      // Update local state to reflect changes
      setVerifications(verifications.filter(v => v.vid !== selectedVerification.vid));
      
      // Close modal and reset state
      setShowModal(false);
      setSelectedVerification(null);
      setVerificationInProgress(false);
      
    } catch (err) {
      console.error("Error updating verification status:", err);
      setError("Failed to update verification status. Please try again.");
      setVerificationInProgress(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Student Verification Queue</h2>
          <p className="text-muted">Verify student accounts to allow them to apply for jobs</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/moderator-dashboard" variant="outline-primary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {verifications.length === 0 ? (
        <Alert variant="info">
          No pending verifications at this time.
        </Alert>
      ) : (
        <Card>
          <Card.Header>
            <Row>
              <Col>Pending Verifications ({verifications.length})</Col>
            </Row>
          </Card.Header>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>UCID</th>
                <th>Major</th>
                <th>Email</th>
                <th>Graduation Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((verification) => (
                <tr key={verification.vid}>
                  <td>{verification.student?.name}</td>
                  <td>{verification.applicantUcid}</td>
                  <td>{verification.student?.major}</td>
                  <td>{verification.student?.email}</td>
                  <td>{verification.student?.graduationYear}</td>
                  <td>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleVerify(verification)}
                    >
                      Verify
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Verification Decision Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Student Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVerification && (
            <>
              <p>
                <strong>Student:</strong> {selectedVerification.student?.name}
              </p>
              <p>
                <strong>UCID:</strong> {selectedVerification.applicantUcid}
              </p>
              <p>
                <strong>Major:</strong> {selectedVerification.student?.major}
              </p>
              <p>
                <strong>Graduation Year:</strong> {selectedVerification.student?.graduationYear}
              </p>

              <Form.Group className="mb-3">
                <Form.Label>Verification Status</Form.Label>
                <Form.Select 
                  value={verificationStatus} 
                  onChange={(e) => setVerificationStatus(e.target.value)}
                >
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Optional verification notes"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={verificationStatus === 'Verified' ? 'success' : 'danger'} 
            onClick={handleSubmitVerification}
            disabled={verificationInProgress}
          >
            {verificationInProgress ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Processing...</span>
              </>
            ) : (
              verificationStatus === 'Verified' ? 'Approve Account' : 'Reject Account'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default StudentVerificationQueue; 