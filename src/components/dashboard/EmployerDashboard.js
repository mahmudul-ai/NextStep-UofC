import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const DashboardSection = styled.div`
  margin-bottom: 2rem;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ddd;
`;

const Tab = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  background: ${props => props.active ? '#4a69bd' : 'transparent'};
  color: ${props => props.active ? 'white' : 'black'};
  cursor: pointer;
  margin-right: 1rem;
  border-radius: 4px 4px 0 0;
`;

const InfoCard = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
`;

const Button = styled.button`
  background-color: #4a69bd;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: #3c58a8;
  }
`;

const JobCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ApplicationCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  margin-left: 5px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.primary ? '#4a69bd' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : 'black'};
`;

const EmployerDashboard = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //mock data
    setJobs([
      { id: 1, title: 'Frontend Developer', applications: 5, status: 'Active', posted: '2023-09-01' },
      { id: 2, title: 'UX Designer', applications: 3, status: 'Active', posted: '2023-08-25' },
    ]);
    
    setApplications([
      { 
        id: 101, 
        job: 'Frontend Developer', 
        applicant: 'John Doe',
        email: 'john@example.com',
        applied: '2023-09-05',
        status: 'New'
      },
      { 
        id: 102, 
        job: 'Frontend Developer', 
        applicant: 'Jane Smith',
        email: 'jane@example.com',
        applied: '2023-09-04',
        status: 'Reviewing'
      },
    ]);
    
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>Employer Dashboard</h1>
      
      <InfoCard>
        <h3>Welcome back!</h3>
        <p>You have {jobs.length} active job postings and {applications.length} unreviewed applications.</p>
        <Link to="/post-job">
          <Button>Post a New Job</Button>
        </Link>
      </InfoCard>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'jobs'} 
          onClick={() => setActiveTab('jobs')}
        >
          My Job Postings
        </Tab>
        <Tab 
          active={activeTab === 'applications'} 
          onClick={() => setActiveTab('applications')}
        >
          Applications
        </Tab>
      </TabContainer>
      
      {activeTab === 'jobs' && (
        <DashboardSection>
          <h2>My Job Postings</h2>
          {jobs.length === 0 ? (
            <p>You haven't posted any jobs yet.</p>
          ) : (
            <>
              {jobs.map(job => (
                <JobCard key={job.id}>
                  <h3>{job.title}</h3>
                  <p>Status: {job.status}</p>
                  <p>Posted: {job.posted}</p>
                  <p>Applications: {job.applications}</p>
                  <div>
                    <ActionButton onClick={() => console.log('View job', job.id)}>View Details</ActionButton>
                    <ActionButton onClick={() => console.log('Edit job', job.id)}>Edit</ActionButton>
                    <ActionButton onClick={() => console.log('Close job', job.id)}>Close Position</ActionButton>
                  </div>
                </JobCard>
              ))}
            </>
          )}
        </DashboardSection>
      )}
      
      {activeTab === 'applications' && (
        <DashboardSection>
          <h2>Applications Received</h2>
          {applications.length === 0 ? (
            <p>You haven't received any applications yet.</p>
          ) : (
            <>
              {applications.map(app => (
                <ApplicationCard key={app.id}>
                  <div>
                    <h3>{app.applicant}</h3>
                    <p>Job: {app.job}</p>
                    <p>Status: {app.status}</p>
                    <p>Applied: {app.applied}</p>
                  </div>
                  <div>
                    <ActionButton primary onClick={() => console.log('View application', app.id)}>
                      View Profile
                    </ActionButton>
                    <ActionButton onClick={() => console.log('Approve application', app.id)}>
                      Contact
                    </ActionButton>
                    <ActionButton onClick={() => console.log('Reject application', app.id)}>
                      Reject
                    </ActionButton>
                  </div>
                </ApplicationCard>
              ))}
            </>
          )}
        </DashboardSection>
      )}
    </div>
  );
};

export default EmployerDashboard; 