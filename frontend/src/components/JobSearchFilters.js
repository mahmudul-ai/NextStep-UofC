import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

function JobSearchFilters({ onApplyFilters, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    keyword: initialFilters.keyword || '',
    location: initialFilters.location || '',
    minSalary: initialFilters.minSalary || '',
    maxSalary: initialFilters.maxSalary || '',
    industry: initialFilters.industry || '',
    jobType: initialFilters.jobType || '',
    experienceLevel: initialFilters.experienceLevel || '',
    showAdvanced: false
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle advanced filters
  const toggleAdvancedFilters = () => {
    setFilters(prev => ({
      ...prev,
      showAdvanced: !prev.showAdvanced
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      minSalary: '',
      industry: '',
      showAdvanced: filters.showAdvanced
    });
    
    // Apply the cleared filters
    onApplyFilters({});
  };

  // Submit filters to parent component
  const handleSubmit = (e) => {
    e.preventDefault();
  
    const filterData = { ...filters };
    delete filterData.showAdvanced;
  
    // Remove empty values
    Object.keys(filterData).forEach(key => {
      if (!filterData[key]) {
        delete filterData[key];
      }
    });
  
    onApplyFilters(filterData); 
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Search Keywords</Form.Label>
                <Form.Control
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleChange}
                  placeholder="Job title, skills, etc."
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleChange}
                  placeholder="City, province, etc."
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Minimum Salary</Form.Label>
                <Form.Control
                  type="number"
                  name="minSalary"
                  value={filters.minSalary}
                  onChange={handleChange}
                  placeholder="Minimum salary"
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Advanced Filters Section */}
          {filters.showAdvanced && (
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Industry</Form.Label>
                  <Form.Select
                    name="industry"
                    value={filters.industry}
                    onChange={handleChange}
                  >
                    <option value="">All Industries</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                    <option value="Engineering">Engineering</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Type</Form.Label>
                  <Form.Select
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleChange}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Experience Level</Form.Label>
                  <Form.Select
                    name="experienceLevel"
                    value={filters.experienceLevel}
                    onChange={handleChange}
                  >
                    <option value="">All Levels</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
          
          <div className="d-flex justify-content-between mt-3">
            <Button variant="link" onClick={toggleAdvancedFilters} type="button">
              {filters.showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
            </Button>
            
            <div>
              <Button variant="outline-secondary" className="me-2" onClick={clearFilters} type="button">
                Clear Filters
              </Button>
              <Button variant="primary" type="submit">
                Apply Filters
              </Button>
            </div>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default JobSearchFilters; 