import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 150px;
`;

const Button = styled.button`
  background-color: #4a69bd;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #3c58a8;
  }
`;

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    //API call
    const fetchJobs = async () => {
      try {
        //mock data
        const mockJobs = [
          {
            id: 1,
            title: 'Frontend Developer',
            company: 'Tech Solutions Inc',
            location: 'Calgary',
            description: 'We are looking for a skilled Frontend Developer with experience in React.',
            posted: '2023-09-01'
          },
          {
            id: 2,
            title: 'Backend Engineer',
            company: 'Data Systems',
            location: 'Remote',
            description: 'Backend Engineer needed for our growing team. Experience with Django required.',
            posted: '2023-08-28'
          },
          {
            id: 3,
            title: 'UX Designer',
            company: 'Creative Studios',
            location: 'Edmonton',
            description: 'Creative UX Designer needed to work on exciting projects.',
            posted: '2023-09-05'
          },
          {
            id: 4,
            title: 'Full Stack Developer',
            company: 'Web Innovations',
            location: 'Calgary',
            description: 'Full Stack Developer with React and Node.js experience needed for our startup.',
            posted: '2023-09-03'
          },
        ];
        
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    //filter jobs based on search term and location
    const filtered = jobs.filter(job => {
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesLocation = 
        locationFilter === '' || job.location.toLowerCase() === locationFilter.toLowerCase();
        
      return matchesSearch && matchesLocation;
    });
    
    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobs]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
  };

  if (loading) {
    return <Container>Loading jobs...</Container>;
  }

  //unique locations for filter dropdown
  const locations = [...new Set(jobs.map(job => job.location))];

  return (
    <Container>
      <h1>Available Jobs</h1>
      
      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="Search jobs by title, company, or keywords"
          value={searchTerm}
          onChange={handleSearch}
        />
        
        <Select value={locationFilter} onChange={handleLocationChange}>
          <option value="">All Locations</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </Select>
        
        <Button onClick={clearFilters}>Clear Filters</Button>
      </FilterContainer>
      
      {filteredJobs.length === 0 ? (
        <p>No jobs match your criteria. Try adjusting your filters.</p>
      ) : (
        <Grid>
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              footer={`Posted: ${job.posted}`}
              actions={[
                { label: 'Apply Now', onClick: () => console.log('Apply to job', job.id) },
                { label: 'Save', onClick: () => console.log('Save job', job.id) }
              ]}
            />
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default JobList; 