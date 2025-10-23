import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is important for handling cookies/sessions
});

// Add request logging
api.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login could be handled here
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    console.log('API: Sending login request...');
    const response = await api.post('/auth/login', credentials);
    const { token, user } = response.data;
    console.log('API: Login response:', { token: !!token, user });
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('API: Stored auth data in localStorage');
    return { token, user };
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response.data;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
  }
};

// Files API calls
export const filesAPI = {
  uploadFile: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(progress);
      },
    });
    return response.data;
  },

  getFiles: async () => {
    const response = await api.get('/files');
    return response.data.files;
  },

  getFile: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data.file;
  },

  deleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
  },

  parseFile: async (fileId) => {
    const response = await api.post(`/files/${fileId}/parse`);
    return response.data;
  }
};

// Charts API calls
export const chartsAPI = {
  createChart: async (chartData) => {
    const response = await api.post('/charts', chartData);
    return response.data.chart;
  },

  getCharts: async () => {
    const response = await api.get('/charts');
    return response.data.charts;
  },

  getChart: async (chartId) => {
    const response = await api.get(`/charts/${chartId}`);
    return response.data.chart;
  },

  updateChart: async (chartId, chartData) => {
    const response = await api.put(`/charts/${chartId}`, chartData);
    return response.data.chart;
  },

  deleteChart: async (chartId) => {
    const response = await api.delete(`/charts/${chartId}`);
    return response.data;
  },

  getPublicCharts: async () => {
    const response = await api.get('/charts/public');
    return response.data.charts;
  }
};

export default api;