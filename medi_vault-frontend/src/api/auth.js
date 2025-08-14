import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000', // Your backend server URL
  withCredentials: true, // Optional, for cookies/JWT if needed
});

export const signup = (formData) => API.post('/api/auth/signup', formData);
export const login = (formData) => API.post('/api/auth/login', formData);
