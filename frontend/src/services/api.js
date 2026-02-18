import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('[API] Configured baseURL:', api.defaults.baseURL);

// Request interceptor for attaching the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Token attached to request');
    }
    console.log('[API] Request URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response status:', response.status, 'URL:', response.config.url);
    return response;
  },
  (error) => {
    console.error('[API] Error status:', error.response?.status, 'URL:', error.config?.url);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Handle authentication errors
      if (error.response?.data?.error === 'EMPLOYEE_NOT_FOUND') {
        localStorage.removeItem('token');
        window.location.href = '/login?error=EMPLOYEE_NOT_FOUND';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
