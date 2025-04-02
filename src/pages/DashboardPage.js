import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import EmployerDashboard from '../components/dashboard/EmployerDashboard';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const DashboardPage = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <DashboardContainer>
      {currentUser.role === 'student' ? (
        <StudentDashboard />
      ) : currentUser.role === 'employer' ? (
        <EmployerDashboard />
      ) : (
        <div>
          <h2>Welcome to your dashboard!</h2>
          <p>Your account is under review. Please check back later.</p>
        </div>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage; 