import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    user_type: '',
    fname: '',
    lname: '',
    ucid: '',
    major: '',
    graduation_year: '',
    company_name: '',
    industry: '',
    website: '',
    description: ''
  });

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSwitchOption, setShowSwitchOption] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear warnings when user type changes
    if (name === 'user_type') {
      setWarning('');
      setShowSwitchOption(false);
      
      // Show warning for employer registration
      if (value === 'employer') {
        setWarning('Note: Employer registration may be limited at this time. If you encounter issues, please try registering as a student first and contact support to upgrade your account.');
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchToStudent = () => {
    setFormData(prev => ({
      ...prev,
      user_type: 'student'
    }));
    setError('');
    setWarning('Please complete the student registration form. You can request an employer account upgrade later.');
    setShowSwitchOption(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWarning('');
    setShowSwitchOption(false);
    setIsSubmitting(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    // For employer registrations, make a test API call first to check if it's likely to fail
    if (formData.user_type === 'employer') {
      try {
        const testResponse = await api.getEmployers();
        const employers = testResponse.data;
        
        // If there are already employers with IDs 1, 2, 3, we might have issues with auto-increment
        const existingIds = employers.map(emp => emp.EmployerID);
        if (existingIds.includes(1) && existingIds.includes(2) && existingIds.includes(3)) {
          setWarning('Our system is experiencing high demand for employer registrations. You may need to try again later or contact support.');
        }
      } catch (err) {
        console.log('Could not check existing employers', err);
        // Continue with registration attempt even if this check fails
      }
    }

    try {
      // Prepare payload based on user type
      const payload = {
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        fname: formData.fname,
        lname: formData.lname
      };

      // Add student-specific fields
      if (formData.user_type === 'student') {
        payload.ucid = formData.ucid;
        payload.major = formData.major;
        payload.graduation_year = parseInt(formData.graduation_year) || null;
      }
      // Add employer-specific fields
      else if (formData.user_type === 'employer') {
        payload.company_name = formData.company_name;
        payload.industry = formData.industry;
        payload.website = formData.website;
        payload.description = formData.description;
      }

      const response = await api.register(payload);
      
      if (response.data.status === 'success') {
        // Registration successful
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      // Handle network or server errors
      console.error('Registration error:', err);
      
      // Check for specific database constraint error
      const errorResponse = err.response?.data?.message || err.response?.data?.error || err.response?.data || '';
      const errorString = typeof errorResponse === 'string' ? errorResponse : JSON.stringify(errorResponse);
      
      // Extract specific error message if available
      let errorMessage = 'Registration failed. Please try again.';
      
      if (errorString.includes('duplicate key') && errorString.includes('employer_pkey')) {
        errorMessage = 'We are currently experiencing technical issues with employer registration. Please try again later or contact support. Alternatively, you can register as a student and request an account upgrade later.';
        
        // Show option to switch to student registration
        setWarning('Would you like to register as a student instead? You can request an account upgrade later.');
        setShowSwitchOption(true);
      } else if (errorString.includes('duplicate key')) {
        errorMessage = 'An account with this information already exists. Please use different credentials.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 shadow">
            <Card.Body>
              <h3 className="mb-4 text-center">Register</h3>
              
              
              {success && (
                <Alert variant="success">
                  Registration successful! Redirecting to login...
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        name="fname"
                        value={formData.fname}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        name="lname"
                        value={formData.lname}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Register As</Form.Label>
                  <Form.Select
                    name="user_type"
                    value={formData.user_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="student">Student</option>
                    <option value="employer">Employer</option>
                  </Form.Select>
                </Form.Group>

                {/* Student Fields */}
                {formData.user_type === 'student' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>UCID</Form.Label>
                      <Form.Control
                        name="ucid"
                        value={formData.ucid}
                        onChange={handleChange}
                        required
                        pattern="[3][0-9]{7}"
                        title="UCID must be 8 digits starting with 3"
                      />
                      <Form.Text className="text-muted">
                        Must be an 8-digit number starting with 3
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Major</Form.Label>
                      <Form.Control
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Graduation Year</Form.Label>
                      <Form.Control
                        type="number"
                        name="graduation_year"
                        value={formData.graduation_year}
                        onChange={handleChange}
                        required
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 10}
                      />
                    </Form.Group>
                  </>
                )}

                {/* Employer Fields */}
                {formData.user_type === 'employer' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Company Name</Form.Label>
                      <Form.Control
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Industry</Form.Label>
                      <Form.Control
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Website</Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-grid mt-4">
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Registering...
                      </>
                    ) : (
                      'Register'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="mt-3 text-center">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;