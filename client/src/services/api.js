import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: async (email, password, firstName, lastName) => {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      firstName, 
      lastName 
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Projects API calls
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (name, description) => {
    const response = await api.post('/projects', { name, description });
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  },
};

// Feedback API calls
export const feedbackAPI = {
  getAll: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/feedback`);
    return response.data;
  },

  getById: async (projectId, feedbackId) => {
    const response = await api.get(`/projects/${projectId}/feedback/${feedbackId}`);
    return response.data;
  },

  create: async (projectId, text, customerName, customerEmail, dateReceived) => {
    const response = await api.post(`/projects/${projectId}/feedback`, {
      text,
      customerName,
      customerEmail,
      dateReceived
    });
    return response.data;
  },

  uploadCSV: async (projectId, csvData) => {
    const response = await api.post(`/projects/${projectId}/feedback/upload-csv`, {
      csvData
    });
    return response.data;
  },

  delete: async (projectId, feedbackId) => {
    const response = await api.delete(`/projects/${projectId}/feedback/${feedbackId}`);
    return response.data;
  },

  deleteAll: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}/feedback`);
    return response.data;
  },
};

// Analysis API calls
export const analysisAPI = {
  analyzeSingle: async (projectId, feedbackId) => {
    const response = await api.post(`/projects/${projectId}/feedback/${feedbackId}/analyze`);
    return response.data;
  },

  analyzeProject: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/analyze`);
    return response.data;
  },

  getAnalysis: async (projectId, feedbackId) => {
    const response = await api.get(`/projects/${projectId}/feedback/${feedbackId}/analysis`);
    return response.data;
  },

  getAllAnalyses: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/analyses`);
    return response.data;
  },

  deleteAnalysis: async (projectId, feedbackId) => {
    const response = await api.delete(`/projects/${projectId}/feedback/${feedbackId}/analysis`);
    return response.data;
  },
  
  generateSummary: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/summary`);
    return response.data;
  },
};

export default api;