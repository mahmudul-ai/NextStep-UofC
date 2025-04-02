import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #4a69bd;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: #555;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PrimaryButton = styled(Link)`
  background-color: #4a69bd;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3c58a8;
  }
`;

const SecondaryButton = styled(Link)`
  background-color: white;
  color: #4a69bd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  border: 1px solid #4a69bd;
  transition: background-color 0.3s;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const FeaturesSection = styled.section`
  margin-bottom: 3rem;
`;

const FeaturesTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #4a69bd;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #555;
`;

const CTASection = styled.section`
  text-align: center;
  padding: 3rem;
  background-color: #4a69bd;
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
`;

const CTATitle = styled.h2`
  margin-bottom: 1rem;
`;

const CTADescription = styled.p`
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const StatsSection = styled.section`
  margin-bottom: 3rem;
`;

const StatsTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
`;

const StatCard = styled.div`
  padding: 1.5rem;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #4a69bd;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #555;
`;

const HomePage = () => {
  return (
    <Container>
      <Hero>
        <HeroTitle>Find Your Dream Career</HeroTitle>
        <HeroSubtitle>
          UCalgary Job Board connects University of Calgary students with 
          employers for internships, part-time, and full-time opportunities.
        </HeroSubtitle>
        <ButtonGroup>
          <PrimaryButton to="/jobs">Browse Jobs</PrimaryButton>
          <SecondaryButton to="/register">Create Account</SecondaryButton>
        </ButtonGroup>
      </Hero>

      <FeaturesSection>
        <FeaturesTitle>How It Works</FeaturesTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>👤</FeatureIcon>
            <FeatureTitle>Create Your Profile</FeatureTitle>
            <FeatureDescription>
              Create an account as a student or employer and build your profile 
              to showcase your skills or company.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureTitle>Search Opportunities</FeatureTitle>
            <FeatureDescription>
              Students can browse and search for job postings that match their 
              skills and interests.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>📝</FeatureIcon>
            <FeatureTitle>Apply with Ease</FeatureTitle>
            <FeatureDescription>
              Submit applications directly through the platform and track your 
              application status.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </FeaturesSection>

      <CTASection>
        <CTATitle>For Employers</CTATitle>
        <CTADescription>
          Post job opportunities and connect with talented UCalgary students and graduates. 
          Our platform helps you find the perfect candidates for your team.
        </CTADescription>
        <PrimaryButton to="/register" style={{ backgroundColor: 'white', color: '#4a69bd' }}>
          Get Started
        </PrimaryButton>
      </CTASection>

      <StatsSection>
        <StatsTitle>UCalgary Job Board Impact</StatsTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>500+</StatNumber>
            <StatLabel>Active Job Postings</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatNumber>1,000+</StatNumber>
            <StatLabel>Registered Students</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatNumber>200+</StatNumber>
            <StatLabel>Employer Partners</StatLabel>
          </StatCard>
          
          <StatCard>
            <StatNumber>80%</StatNumber>
            <StatLabel>Success Rate</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsSection>
    </Container>
  );
};

export default HomePage; 