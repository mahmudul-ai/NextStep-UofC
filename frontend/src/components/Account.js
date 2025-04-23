// Import necessary React hooks and UI components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner, ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Account() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const ucid = localStorage.getItem('ucid');
  const employerId = localStorage.getItem('employerId');
  const moderatorId = localStorage.getItem('moderatorId');

  // State hooks for user details and UI messages
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    companyName: '',
    companyDescription: '',
    website: '',
    location: '',
    major: '',
    graduationYear: ''
  });

  // On initial render, fetch user details from the backend
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        
        let response;
        if (userRole === 'student') {
          response = await api.getStudentProfile(ucid);
          
          // Normalize data fields - handle both naming conventions
          setFormData({
            email: response.data.Email || response.data.email || '',
            firstName: response.data.FirstName || response.data.FName || '',
            lastName: response.data.LastName || response.data.LName || '',
            phone: response.data.Phone || response.data.phone || '',
            bio: response.data.Bio || response.data.bio || '',
            major: response.data.Major || response.data.major || '',
            graduationYear: response.data.GraduationYear || response.data.graduationYear || ''
          });
        } 
        else if (userRole === 'employer') {
          response = await api.getEmployer(employerId);
          
          // Normalize data fields - handle both naming conventions
          setFormData({
            email: response.data.Email || response.data.email || '',
            companyName: response.data.CompanyName || response.data.companyName || '',
            companyDescription: response.data.Description || response.data.description || '',
            website: response.data.Website || response.data.website || '',
            location: response.data.Location || response.data.location || '',
            phone: response.data.Phone || response.data.phone || ''
          });
        }
        else if (userRole === 'moderator') {
          response = await api.getStudentProfile(ucid);
          
          // Normalize data fields - handle both naming conventions
          setFormData({
            email: response.data.Email || response.data.email || '',
            firstName: response.data.FirstName || response.data.FName || '',
            lastName: response.data.LastName || response.data.LName || '',
            phone: response.data.Phone || response.data.phone || '',
            bio: response.data.Bio || response.data.bio || ''
          });
        }
        
        setUserDetails(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching account details:', err);
        setError('Failed to load account details. Please try again later.');
        setLoading(false);
      }
    };

    if (userRole) {
      fetchUserDetails();
    } else {
      navigate('/login');
    }
  }, [userRole, ucid, employerId, moderatorId, navigate]);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission to update user details
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate the form data
    const formErrors = validateForm();
    if (formErrors) {
      setError('Please fix the form errors before submitting.');
      // Store validation errors in state for display
      setValidationErrors(formErrors);
      return;
    }
    
    // Clear any previous validation errors
    setValidationErrors({});
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Updating user profile for role:', userRole);
      
      let response;
      if (userRole === 'student') {
        console.log('Updating student profile with data:', {
          ucid,
          data: {
            UCID: ucid,
            Email: formData.email,
            FName: formData.firstName,
            LName: formData.lastName,
            Phone: formData.phone,
            Bio: formData.bio,
            Major: formData.major,
            GraduationYear: formData.graduationYear
          }
        });
        
        // Use the API's updateStudentProfile method instead of direct endpoint
        response = await api.updateStudentProfile(ucid, {
          UCID: ucid,
          Email: formData.email,
          FName: formData.firstName,
          LName: formData.lastName,
          Phone: formData.phone,
          Bio: formData.bio,
          Major: formData.major,
          GraduationYear: formData.graduationYear
        });
        
        console.log('Student profile update response:', response);
        
        // Update local storage with the new name if changed
        const oldFirstName = localStorage.getItem('firstName');
        const oldLastName = localStorage.getItem('lastName');
        
        if (oldFirstName !== formData.firstName) {
          localStorage.setItem('firstName', formData.firstName);
        }
        
        if (oldLastName !== formData.lastName) {
          localStorage.setItem('lastName', formData.lastName);
        }
      } 
      else if (userRole === 'employer') {
        console.log('Updating employer profile with data:', {
          employerId,
          data: {
            Email: formData.email,
            CompanyName: formData.companyName,
            Description: formData.companyDescription,
            Website: formData.website,
            Location: formData.location,
            Phone: formData.phone
          }
        });
        
        // Use the API's updateEmployer method which now handles VerificationStatus
        response = await api.updateEmployer(employerId, {
          Email: formData.email,
          CompanyName: formData.companyName,
          Description: formData.companyDescription,
          Website: formData.website,
          Location: formData.location,
          Phone: formData.phone
        });
        
        console.log('Employer profile update response:', response);
        
        // Update local storage if company name changed
        const oldCompanyName = localStorage.getItem('companyName');
        if (oldCompanyName !== formData.companyName) {
          localStorage.setItem('companyName', formData.companyName);
        }
      }
      
      setUserDetails(response.data);
      setMessage('Profile information updated successfully!');
      setError('');
      setEditMode(false);
      setLoading(false);
      
      // Refresh the page after a short delay to ensure all components see the updated data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Error updating account:', err);
      if (err.response && err.response.data) {
        // Try to extract a meaningful error message
        let errorMessage = 'Failed to update account details.';
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (Object.keys(err.response.data).length > 0) {
          // If the response contains field errors, show the first one
          const firstErrorField = Object.keys(err.response.data)[0];
          errorMessage = `${firstErrorField}: ${err.response.data[firstErrorField]}`;
        }
        setError(errorMessage);
      } else {
        setError('Failed to update account details. Please try again.');
      }
      setLoading(false);
    }
  };

  // Add a helper function to validate form data before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    
    if (userRole === 'student' || userRole === 'moderator') {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      
      // Validate phone number if provided
      if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Phone number must be a valid 10-digit number';
      }
      
      // Validate graduation year if provided
      if (formData.graduationYear) {
        const year = parseInt(formData.graduationYear);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < currentYear || year > currentYear + 10) {
          errors.graduationYear = 'Graduation year must be a valid future year (within 10 years)';
        }
      }
    } else if (userRole === 'employer') {
      if (!formData.companyName) errors.companyName = 'Company name is required';
      
      // Validate phone number if provided
      if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Phone number must be a valid 10-digit number';
      }
      
      // Validate website URL if provided
      if (formData.website && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(formData.website)) {
        errors.website = 'Website must be a valid URL';
      }
    }
    
    // Log validation errors if any
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
    
    return Object.keys(errors).length === 0 ? null : errors;
  };

  if (loading && !userDetails) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title>Account Details</Card.Title>
                {!editMode && (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Success or error messages */}
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              {editMode ? (
                // Edit mode - show form
              <Form onSubmit={handleSubmit}>
                  {userRole === 'student' || userRole === 'moderator' ? (
                    // Student/Moderator fields
                    <>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>First Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              required
                              isInvalid={!!validationErrors.firstName}
                            />
                            {validationErrors.firstName && (
                              <Form.Control.Feedback type="invalid">
                                {validationErrors.firstName}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Last Name</Form.Label>
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              required
                              isInvalid={!!validationErrors.lastName}
                            />
                            {validationErrors.lastName && (
                              <Form.Control.Feedback type="invalid">
                                {validationErrors.lastName}
                              </Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          isInvalid={!!validationErrors.email}
                        />
                        {validationErrors.email && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.email}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      {userRole === 'student' && (
                        <>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Major</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="major"
                                  value={formData.major}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Graduation Year</Form.Label>
                                <Form.Control
                                  type="number"
                                  name="graduationYear"
                                  value={formData.graduationYear}
                                  onChange={handleInputChange}
                                  min={new Date().getFullYear()}
                                  max={new Date().getFullYear() + 10}
                                  isInvalid={!!validationErrors.graduationYear}
                                />
                                {validationErrors.graduationYear && (
                                  <Form.Control.Feedback type="invalid">
                                    {validationErrors.graduationYear}
                                  </Form.Control.Feedback>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>
                        </>
                      )}
                <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.phone}
                        />
                        {validationErrors.phone && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.phone}
                          </Form.Control.Feedback>
                        )}
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself..."
                        />
                      </Form.Group>
                    </>
                  ) : (
                    // Employer fields
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          required
                          isInvalid={!!validationErrors.companyName}
                        />
                        {validationErrors.companyName && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.companyName}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          isInvalid={!!validationErrors.email}
                        />
                        {validationErrors.email && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.email}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          isInvalid={!!validationErrors.phone}
                        />
                        {validationErrors.phone && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.phone}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Website</Form.Label>
                        <Form.Control
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                          isInvalid={!!validationErrors.website}
                        />
                        {validationErrors.website && (
                          <Form.Control.Feedback type="invalid">
                            {validationErrors.website}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                        <Form.Label>Company Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="companyDescription"
                          value={formData.companyDescription}
                          onChange={handleInputChange}
                          placeholder="Tell us about your company..."
                        />
                </Form.Group>
                    </>
                  )}

                  <div className="d-flex justify-content-end mt-4">
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => {
                        setEditMode(false);
                        setMessage('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                </Button>
                  </div>
              </Form>
              ) : (
                // View mode - show user details without editing options
                <ListGroup variant="flush">
                  
                  
                  {userRole === 'student' || userRole === 'moderator' ? (
                    // Student/Moderator details display
                    <>
                      <ListGroup.Item>
                        <strong>UCID:</strong> {ucid}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>First Name:</strong> {formData.firstName}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Last Name:</strong> {formData.lastName}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Email:</strong> {formData.email}
                      </ListGroup.Item>
                      {userRole === 'student' && (
                        <>
                          {formData.major && (
                            <ListGroup.Item>
                              <strong>Major:</strong> {formData.major}
                            </ListGroup.Item>
                          )}
                          {formData.graduationYear && (
                            <ListGroup.Item>
                              <strong>Graduation Year:</strong> {formData.graduationYear}
                            </ListGroup.Item>
                          )}
                        </>
                      )}
                      {formData.phone && (
                        <ListGroup.Item>
                          <strong>Phone:</strong> {formData.phone}
                        </ListGroup.Item>
                      )}
                      {formData.bio && (
                        <ListGroup.Item>
                          <strong>Bio:</strong>
                          <p className="mt-2 mb-0">{formData.bio}</p>
                        </ListGroup.Item>
                      )}
                    </>
                  ) : (
                    // Employer details display
                    <>
                      <ListGroup.Item>
                        <strong>Company ID:</strong> {employerId}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Company Name:</strong> {formData.companyName}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Email:</strong> {formData.email}
                      </ListGroup.Item>
                      {formData.phone && (
                        <ListGroup.Item>
                          <strong>Phone:</strong> {formData.phone}
                        </ListGroup.Item>
                      )}
                      {formData.website && (
                        <ListGroup.Item>
                          <strong>Website:</strong> {formData.website}
                        </ListGroup.Item>
                      )}
                      {formData.location && (
                        <ListGroup.Item>
                          <strong>Location:</strong> {formData.location}
                        </ListGroup.Item>
                      )}
                      {formData.companyDescription && (
                        <ListGroup.Item>
                          <strong>Company Description:</strong>
                          <p className="mt-2 mb-0">{formData.companyDescription}</p>
                        </ListGroup.Item>
                      )}
                    </>
                  )}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Account;
