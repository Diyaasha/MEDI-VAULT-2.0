import axios from 'axios';

const API = axios.create({
  baseURL: 'https://medi-vault-zsg1.onrender.com',
});

export const signup = (formData) => API.post('/api/auth/signup', formData);
export const login = (formData) => API.post('/api/auth/login', formData);
