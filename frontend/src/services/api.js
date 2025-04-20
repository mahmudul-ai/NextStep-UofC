// Import Axios for making HTTP requests
import axios from 'axios';

// Set the base URL for API calls — use env variable if defined, otherwise default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

// Create an Axios instance with base URL and default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to automatically attach the token (if it exists) to every outgoing request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
  }
  return config;
});

// Export the configured Axios instance for use across the app
export default api;
