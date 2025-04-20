// Import React hooks and Bootstrap components
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import JobCard from './JobCard'; // Reusable component for displaying each job
import api from '../services/api'; // Axios instance for backend API calls

function BrowseJobs() {
  // State to hold fetched jobs and any potential error message
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  // useEffect runs once when the component is mounted — used here to load job listings
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/'); // Fetch jobs from backend
        setJobs(response.data); // Store job list in state
        console.log("Jobs fetched:", response.data); // Optional: helpful for debugging
      } catch (err) {
        console.error("Error fetching jobs", err);
        setError("Error fetching jobs"); // Show a user-friendly error message
      }
    };
    fetchJobs();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="mb-4">Job Listings</h2>

      {/* Display error message if something went wrong */}
      {error && <p className="text-danger">{error}</p>}

      {/* Display each job in a responsive grid layout */}
      <Row className="g-4">
        {jobs.map((job) => (
          <Col key={job.id} xs={12} md={6} lg={4}>
            <JobCard job={job} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default BrowseJobs;
