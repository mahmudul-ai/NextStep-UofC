// src/components/BrowseJobs.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import JobCard from './JobCard';
import api from '../services/api';

function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await api.get('/jobs/');
        setJobs(response.data);
        console.log("Jobs fetched:", response.data);
      } catch (err) {
        console.error("Error fetching jobs", err);
        setError("Error fetching jobs");
      }
    };
    fetchJobs();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="mb-4">Job Listings</h2>
      {error && <p className="text-danger">{error}</p>}
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
