import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
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
        payload.graduation_year = formData.graduation_year;
      }
      // Add employer-specific fields
      else if (formData.user_type === 'employer') {
        payload.company_name = formData.company_name;
        payload.industry = formData.industry;
        payload.website = formData.website;
        payload.description = formData.description;
      }

      const response = await api.post('/register/', payload);
      console.log(response);
      
      if (response.data.status === 'success') {
        // Registration successful
        
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      // Handle network or server errors
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
              
              {error && <Alert variant="danger">{error}</Alert>}
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
                      />
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
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </Button>
                </div>
              </Form>

              <div className="mt-3 text-center">
                Already have an account? <a href="/login">Login here</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;