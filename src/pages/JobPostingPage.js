import React, { useContext } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 150px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const Button = styled.button`
  background-color: #4a69bd;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;

  &:hover {
    background-color: #3c58a8;
  }
`;

const ErrorText = styled.div`
  color: red;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const JobPostingPage = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  //redirect if not an employer
  if (currentUser && currentUser.role !== 'employer') {
    navigate('/dashboard');
    return null;
  }

  const initialValues = {
    title: '',
    company: currentUser?.company || '',
    location: '',
    workType: 'full-time',
    description: '',
    requirements: '',
    salaryRange: '',
    applicationDeadline: '',
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    company: Yup.string().required('Required'),
    location: Yup.string().required('Required'),
    workType: Yup.string().required('Required'),
    description: Yup.string().required('Required').min(50, 'Description should be at least 50 characters'),
    requirements: Yup.string().required('Required'),
    salaryRange: Yup.string(),
    applicationDeadline: Yup.date().min(
      new Date(Date.now() - 86400000),
      'Deadline cannot be in the past'
    ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      //API call
      console.log('Posting job:', values);
      
      //API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Job posted successfully!');
      resetForm();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('Failed to post job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <h1>Post a New Job</h1>
      <p>Fill out the form below to create a new job posting.</p>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <FormGroup>
              <Label htmlFor="title">Job Title</Label>
              <Field as={Input} name="title" id="title" placeholder="e.g., Frontend Developer" />
              <ErrorMessage name="title" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="company">Company Name</Label>
              <Field as={Input} name="company" id="company" placeholder="Your company name" />
              <ErrorMessage name="company" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="location">Location</Label>
              <Field as={Input} name="location" id="location" placeholder="e.g., Calgary, Remote" />
              <ErrorMessage name="location" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="workType">Employment Type</Label>
              <Field as={Select} name="workType" id="workType">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="temporary">Temporary</option>
              </Field>
              <ErrorMessage name="workType" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="description">Job Description</Label>
              <Field 
                as={TextArea} 
                name="description" 
                id="description" 
                placeholder="Provide a detailed description of the job role and responsibilities" 
              />
              <ErrorMessage name="description" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="requirements">Requirements</Label>
              <Field 
                as={TextArea} 
                name="requirements" 
                id="requirements" 
                placeholder="List the skills, qualifications, and experience required for this role" 
              />
              <ErrorMessage name="requirements" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="salaryRange">Salary Range (Optional)</Label>
              <Field 
                as={Input} 
                name="salaryRange" 
                id="salaryRange" 
                placeholder="e.g., $60,000 - $80,000 per year" 
              />
              <ErrorMessage name="salaryRange" component={ErrorText} />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="applicationDeadline">Application Deadline (Optional)</Label>
              <Field 
                as={Input} 
                type="date" 
                name="applicationDeadline" 
                id="applicationDeadline" 
              />
              <ErrorMessage name="applicationDeadline" component={ErrorText} />
            </FormGroup>
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default JobPostingPage; 