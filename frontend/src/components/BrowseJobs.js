// Import React hooks and Bootstrap components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import JobCard from './JobCard'; // Reusable component for displaying each job
import JobSearchFilters from './JobSearchFilters'; // Import the search filters component
import api from '../services/api'; // Axios instance for backend API calls
import { useSearchParams } from 'react-router-dom';

function BrowseJobs() {
  // State to hold fetched jobs and any potential error message
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  
  // Get search params from URL
  const [searchParams, setSearchParams] = useSearchParams();
  
  // useEffect runs when the component is mounted or when search params change
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Extract filter values from URL params
        const urlFilters = {};
        const employerParam = searchParams.get('employer');
        const keywordParam = searchParams.get('keyword');
        const locationParam = searchParams.get('location');
        const salaryParam = searchParams.get('salary');
        
        if (employerParam) urlFilters.employerId = parseInt(employerParam);
        if (keywordParam) urlFilters.keyword = keywordParam;
        if (locationParam) urlFilters.location = locationParam;
        if (salaryParam) urlFilters.salary = parseInt(salaryParam);
        
        // Set active filters from URL params
        setActiveFilters(urlFilters);
        
        const response = await api.getJobs(urlFilters);
        setJobs(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching jobs", err);
        setError("Error fetching jobs. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [searchParams]);

  // Apply filters and update URL params
  const handleApplyFilters = (filterData) => {
    // Update search params
    const newSearchParams = {};
    
    if (filterData.keyword) newSearchParams.keyword = filterData.keyword;
    if (filterData.location) newSearchParams.location = filterData.location;
    if (filterData.minSalary) newSearchParams.salary = filterData.minSalary;
    if (filterData.industry) newSearchParams.industry = filterData.industry;
    
    // Keep employer param if it exists in URL
    const employerParam = searchParams.get('employer');
    if (employerParam) newSearchParams.employer = employerParam;
    
    // Set the search params which triggers a re-fetch due to our useEffect
    setSearchParams(newSearchParams);
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Browse Jobs</h2>
      
      {/* Job Search Filters */}
      <JobSearchFilters onApplyFilters={handleApplyFilters} />

      {/* Display error message if something went wrong */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Loading indicator */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {/* Results count and filter summary */}
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div>
              <strong>{jobs.length}</strong> jobs found
              {Object.keys(activeFilters).length > 0 && (
                <span className="text-muted ms-2">
                  with selected filters
                </span>
              )}
            </div>
          </div>

          {/* No results message */}
          {jobs.length === 0 && !loading && (
            <Alert variant="info">
              No jobs found with the selected filters. Try adjusting your search criteria.
            </Alert>
          )}

          {/* Display each job in a responsive grid layout */}
          <Row className="g-4">
            {jobs.map((job) => (
              <Col key={job.jobId} xs={12} md={6} lg={4}>
                <JobCard job={job} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
}

export default BrowseJobs;
