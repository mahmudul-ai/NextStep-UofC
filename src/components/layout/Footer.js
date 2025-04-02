import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #f8f9fa;
  padding: 2rem;
  margin-top: 3rem;
  border-top: 1px solid #e9ecef;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  margin-bottom: 1rem;
  color: #4a69bd;
`;

const FooterLink = styled(Link)`
  color: #555;
  text-decoration: none;
  margin-bottom: 0.5rem;

  &:hover {
    color: #4a69bd;
  }
`;

const FooterExternalLink = styled.a`
  color: #555;
  text-decoration: none;
  margin-bottom: 0.5rem;

  &:hover {
    color: #4a69bd;
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  color: #777;
  font-size: 0.9rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterColumn>
          <FooterTitle>UCalgary Job Board</FooterTitle>
          <p>Connecting University of Calgary students with employers for better career opportunities.</p>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>For Students</FooterTitle>
          <FooterLink to="/jobs">Browse Jobs</FooterLink>
          <FooterLink to="/register">Create Account</FooterLink>
          <FooterLink to="/resources">Career Resources</FooterLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>For Employers</FooterTitle>
          <FooterLink to="/post-job">Post a Job</FooterLink>
          <FooterLink to="/register">Create Account</FooterLink>
          <FooterLink to="/faq">Employer FAQ</FooterLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>University Resources</FooterTitle>
          <FooterExternalLink href="https://www.ucalgary.ca" target="_blank" rel="noopener noreferrer">
            UCalgary Website
          </FooterExternalLink>
          <FooterExternalLink href="https://www.ucalgary.ca/careers" target="_blank" rel="noopener noreferrer">
            Career Services
          </FooterExternalLink>
          <FooterExternalLink href="https://www.ucalgary.ca/student-services" target="_blank" rel="noopener noreferrer">
            Student Services
          </FooterExternalLink>
        </FooterColumn>
      </FooterContent>
      
      <Copyright>
        &copy; {new Date().getFullYear()} University of Calgary Job Board. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer; 