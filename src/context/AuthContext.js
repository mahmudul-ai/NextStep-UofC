import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token with backend
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.get('http://localhost:8000/api/users/me/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentUser(response.data);
      setLoading(false);
    } catch (err) {
      localStorage.removeItem('token');
      setLoading(false);
      setError('Session expired. Please login again.');
    }
  };

  const login = async (email, password) => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.post('http://localhost:8000/api/token/', {
        email,
        password
      });
      
      const { access, user } = response.data;
      localStorage.setItem('token', access);
      setCurrentUser(user);
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // Replace with your actual API endpoint
      const response = await axios.post('http://localhost:8000/api/users/', userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 