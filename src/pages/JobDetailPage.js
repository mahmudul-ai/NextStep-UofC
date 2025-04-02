import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const JobHeader = styled.div`
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
`;

const JobTitle = styled.h1`
  margin-bottom: 0.5rem;
  color: #4a69bd;
`;

const CompanyName = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const JobDetail = styled.p`
  margin-bottom: 0.25rem;
  color: #555;
`;

const JobSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const Button = styled.button`
  background-color: ${props => props.secondary ? '#f8f9fa' : '#4a69bd'};
  color: ${props => props.secondary ? '#333' : 'white'};
  padding: 10px 20px;
  border: ${props => props.secondary ? '1px solid #ddd' : 'none'};
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: ${props => props.secondary ? '#e9ecef' : '#3c58a8'};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-top: 2rem;
`;

const JobDetailPage = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        //API call
        //mock data 
        const mockJob = {
          id: parseInt(id),
          title: 'Frontend Developer',
          company: 'Tech Solutions Inc',
          location: 'Calgary',
          workType: 'Full-time',
          description: 'We are looking for a skilled Frontend Developer with experience in React. The ideal candidate will have a strong understanding of web technologies and a passion for creating user-friendly interfaces.',
          requirements: '- 2+ years of experience with React\n- Proficiency in JavaScript, HTML, and CSS\n- Experience with responsive design\n- Knowledge of frontend testing frameworks\n- Bachelor\'s degree in Computer Science or related field',
          salaryRange: '$60,000 - $80,000 per year',
          posted: '2023-09-01',
          applicationDeadline: '2023-10-01',
        };
        
        setJob(mockJob);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleApply = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (currentUser.role !== 'student') {
      alert('Only students can apply for jobs.');
      return;
    }

    setApplying(true);
    try {
      //API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Application submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (currentUser.role !== 'student') {
      alert('Only students can save jobs.');
      return;
    }

    try {
      //API call
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Job saved successfully!');
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    }
  };

  if (loading) {
    return <Container>Loading job details...</Container>;
  }

  if (!job) {
    return <Container>Job not found.</Container>;
  }

  return (
    <Container>
      <JobHeader>
        <JobTitle>{job.title}</JobTitle>
        <CompanyName>{job.company}</CompanyName>
        <JobDetail><strong>Location:</strong> {job.location}</JobDetail>
        <JobDetail><strong>Job Type:</strong> {job.workType}</JobDetail>
        <JobDetail><strong>Posted:</strong> {job.posted}</JobDetail>
        {job.applicationDeadline && (
          <JobDetail><strong>Application Deadline:</strong> {job.applicationDeadline}</JobDetail>
        )}
        {job.salaryRange && (
          <JobDetail><strong>Salary Range:</strong> {job.salaryRange}</JobDetail>
        )}
      </JobHeader>

      <JobSection>
        <SectionTitle>Job Description</SectionTitle>
        <p>{job.description}</p>
      </JobSection>

      <JobSection>
        <SectionTitle>Requirements</SectionTitle>
        <pre>{job.requirements}</pre>
      </JobSection>

      <ButtonGroup>
        <Button onClick={handleApply} disabled={applying}>
          {applying ? 'Submitting...' : 'Apply Now'}
        </Button>
        <Button secondary onClick={handleSave}>
          Save Job
        </Button>
        <Button secondary onClick={() => navigate(-1)}>
          Back to Jobs
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default JobDetailPage; 