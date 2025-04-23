import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

function EmployerVerificationQueue() {
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
        // Use the correct API endpoint for employer verifications
        const response = await api.getEmployerVerificationQueue();
        
        // Map the response data to match the component's expected format
        const formattedData = response.data.map(verification => ({
          vid: verification.ID || verification.id,
          employerId: verification.EmployerID || verification.employerId,
          status: verification.VerificationStatus || verification.status,
          date: verification.Date || verification.date,
          employer: {
            companyName: verification.employer?.CompanyName || verification.employer?.companyName,
            industry: verification.employer?.Industry || verification.employer?.industry,
            email: verification.employer?.Email || verification.employer?.email
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
      
      // Call API to update verification status using the correct endpoint
      await api.verifyEmployer(
        selectedVerification.employerId, 
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
          <h2>Employer Verification Queue</h2>
          <p className="text-muted">Verify employer accounts to allow them to post jobs</p>
        </Col>
        <Col xs="auto">
          <Button as={Link} to="/moderator-dashboard" variant="outline-primary">
            Back to Dashboard
          </Button>
        </Col>
      </Row>

      {verifications.length === 0 ? (
        <Alert variant="info">
          No pending employer verifications at this time.
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
                <th>Company Name</th>
                <th>Industry</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map((verification) => (
                <tr key={verification.vid}>
                  <td>{verification.employer?.companyName}</td>
                  <td>{verification.employer?.industry}</td>
                  <td>{verification.employer?.email}</td>
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
          <Modal.Title>Verify Employer Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVerification && (
            <>
              <p>
                <strong>Company:</strong> {selectedVerification.employer?.companyName}
              </p>
              <p>
                <strong>Industry:</strong> {selectedVerification.employer?.industry}
              </p>
              <p>
                <strong>Email:</strong> {selectedVerification.employer?.email}
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
              verificationStatus === 'Verified' ? 'Approve Company' : 'Reject Company'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default EmployerVerificationQueue; 