import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
