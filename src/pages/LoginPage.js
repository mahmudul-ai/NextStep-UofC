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

const ErrorText = styled.div`
  color: red;
  font-size: 0.8rem;
  margin-bottom: 10px;
`;

const LoginPage = () => {
  const { login, error } = useContext(AuthContext);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const initialValues = {
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Required'),
    password: Yup.string()
      .required('Required'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await login(values.email, values.password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setServerError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <h1>Login</h1>
      {(error || serverError) && <ErrorText>{error || serverError}</ErrorText>}
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>

            <p>
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default LoginPage; 