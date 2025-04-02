import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  background-color: #4a69bd;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: 1rem;

  &:hover {
    background-color: #3c58a8;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('Required'),
    lastName: Yup.string()
      .required('Required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .required('Required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
    role: Yup.string()
      .oneOf(['student', 'employer'], 'Please select a valid role')
      .required('Please select a role'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const userData = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      };
      
      await register(userData);
      navigate('/login');
    } catch (err) {
      setServerError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <h1>Register</h1>
      {serverError && <ErrorText>{serverError}</ErrorText>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div>
              <label htmlFor="firstName">First Name</label>
              <Field as={Input} type="text" name="firstName" id="firstName" />
              <ErrorMessage name="firstName" component={ErrorText} />
            </div>

            <div>
              <label htmlFor="lastName">Last Name</label>
              <Field as={Input} type="text" name="lastName" id="lastName" />
              <ErrorMessage name="lastName" component={ErrorText} />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <Field as={Input} type="email" name="email" id="email" />
              <ErrorMessage name="email" component={ErrorText} />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <Field as={Input} type="password" name="password" id="password" />
              <ErrorMessage name="password" component={ErrorText} />
            </div>

            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <Field as={Input} type="password" name="confirmPassword" id="confirmPassword" />
              <ErrorMessage name="confirmPassword" component={ErrorText} />
            </div>

            <div>
              <label htmlFor="role">I am a</label>
              <Field as={Select} name="role" id="role">
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="employer">Employer</option>
              </Field>
              <ErrorMessage name="role" component={ErrorText} />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>

            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default RegisterPage; 