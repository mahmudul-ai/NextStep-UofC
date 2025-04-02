import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import JobCard from '../jobs/JobCard';

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

const JobList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //API calls to your backend
    const fetchData = async () => {
      try {
        //rReplace with actual endpoints
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        //mock data
        setApplications([
          { id: 1, job: { title: 'Frontend Developer', company: 'Tech Co', location: 'Calgary' }, status: 'Applied', date: '2023-09-15' },
          { id: 2, job: { title: 'Software Engineer', company: 'Code Inc', location: 'Remote' }, status: 'Interview', date: '2023-09-10' },
        ]);
        
        setSavedJobs([
          { id: 101, title: 'Backend Developer', company: 'Data Systems', location: 'Calgary', posted: '2023-09-01' },
          { id: 102, title: 'UX Designer', company: 'Creative Co', location: 'Edmonton', posted: '2023-08-28' },
        ]);
        
        setRecommendations([
          { id: 201, title: 'Junior Developer', company: 'Startup Inc', location: 'Calgary', posted: '2023-09-05' },
          { id: 202, title: 'Mobile Developer', company: 'App Makers', location: 'Vancouver', posted: '2023-09-03' },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>Student Dashboard</h1>
      
      <InfoCard>
        <h3>Welcome back!</h3>
        <p>You have {applications.length} active applications and {recommendations.length} new job recommendations.</p>
      </InfoCard>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'applications'} 
          onClick={() => setActiveTab('applications')}
        >
          My Applications
        </Tab>
        <Tab 
          active={activeTab === 'saved'} 
          onClick={() => setActiveTab('saved')}
        >
          Saved Jobs
        </Tab>
        <Tab 
          active={activeTab === 'recommendations'} 
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
        </Tab>
      </TabContainer>
      
      {activeTab === 'applications' && (
        <DashboardSection>
          <h2>My Applications</h2>
          {applications.length === 0 ? (
            <p>You haven't applied to any jobs yet.</p>
          ) : (
            <JobList>
              {applications.map(app => (
                <JobCard 
                  key={app.id}
                  job={app.job}
                  footer={`Status: ${app.status} | Applied: ${app.date}`}
                />
              ))}
            </JobList>
          )}
        </DashboardSection>
      )}
      
      {activeTab === 'saved' && (
        <DashboardSection>
          <h2>Saved Jobs</h2>
          {savedJobs.length === 0 ? (
            <p>You haven't saved any jobs yet.</p>
          ) : (
            <JobList>
              {savedJobs.map(job => (
                <JobCard 
                  key={job.id}
                  job={job}
                  footer={`Posted: ${job.posted}`}
                  actions={[
                    { label: 'Apply', onClick: () => console.log('Apply to', job.id) },
                    { label: 'Remove', onClick: () => console.log('Remove', job.id) },
                  ]}
                />
              ))}
            </JobList>
          )}
        </DashboardSection>
      )}
      
      {activeTab === 'recommendations' && (
        <DashboardSection>
          <h2>Recommended for You</h2>
          <JobList>
            {recommendations.map(job => (
              <JobCard 
                key={job.id}
                job={job}
                footer={`Posted: ${job.posted}`}
                actions={[
                  { label: 'Apply', onClick: () => console.log('Apply to', job.id) },
                  { label: 'Save', onClick: () => console.log('Save', job.id) },
                ]}
              />
            ))}
          </JobList>
        </DashboardSection>
      )}
    </div>
  );
};

export default StudentDashboard; 