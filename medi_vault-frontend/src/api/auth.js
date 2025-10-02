import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with authentication
const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  // Get user data from localStorage
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }
  return config;
});

export const signup = (formData) => API.post("/auth/signup", formData);
export const login = (formData) => API.post("/auth/login", formData);
export const googleVerify = (idToken) =>
  API.post("/auth/google/verify", { token: idToken });

// Add a function to get current user and verify token validity
export const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export default API;
