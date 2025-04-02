import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Title = styled.h3`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #4a69bd;
`;

const Company = styled.h4`
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Detail = styled.div`
  margin-bottom: 0.5rem;
  color: #555;
  font-size: 0.9rem;
`;

const Footer = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
  color: #777;
`;

const ActionButtons = styled.div`
  display: flex;
  margin-top: 1rem;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.primary ? '#4a69bd' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : '#333'};
  font-size: 0.9rem;

  &:hover {
    background-color: ${props => props.primary ? '#3c58a8' : '#e9ecef'};
  }
`;

const JobCard = ({ job, footer, actions }) => {
  return (
    <Card>
      <Title>{job.title}</Title>
      <Company>{job.company}</Company>
      <Detail>Location: {job.location}</Detail>
      
      {job.description && (
        <Detail>
          {job.description.substring(0, 100)}
          {job.description.length > 100 ? '...' : ''}
        </Detail>
      )}
      
      {footer && <Footer>{footer}</Footer>}
      
      {actions && actions.length > 0 && (
        <ActionButtons>
          {actions.map((action, index) => (
            <Button 
              key={index}
              primary={index === 0}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </ActionButtons>
      )}
    </Card>
  );
};

export default JobCard; 