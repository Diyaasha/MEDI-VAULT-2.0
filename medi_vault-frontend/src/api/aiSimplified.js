import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://medi-vault-zsg1.onrender.com');
const API_URL = `${API_BASE_URL}/api`;

// Create axios instance with authentication
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Get user data from localStorage (matches existing auth system)
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

// AI Simplified API functions
export const aiSimplifiedAPI = {
  // Upload document for AI processing
  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/ai-simplified/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all AI-simplified documents
  getAiSimplifiedDocs: async (category = 'all') => {
    try {
      const response = await api.get(`/ai-simplified/list?category=${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get medical history reports for AI processing
  getMedicalHistoryForAI: async () => {
    try {
      const response = await api.get('/ai-simplified/medical-history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process existing medical history document with AI
  processExistingDocument: async (documentId) => {
    try {
      const response = await api.post(`/ai-simplified/process/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Medical History API functions (for integration)
export const medicalHistoryAPI = {
  // Get all medical history documents
  getDocuments: async () => {
    try {
      const response = await api.get('/medical-history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get signed URL for document download
  getSignedUrl: async (documentId) => {
    try {
      const response = await api.get(`/medical-history/download-url/${documentId}`);
      return response.data.url;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;