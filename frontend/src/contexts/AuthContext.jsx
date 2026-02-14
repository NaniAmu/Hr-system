import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      // Try to fetch user info by making a simple API call
      const response = await api.get('/api/hr/employees');
      // If successful, extract user from token (in real app, decode JWT)
      // For now, we'll store user info in localStorage or get from API
      setUser({ role: 'SUPER_ADMIN' }); // This should come from token decode
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error === 'EMPLOYEE_NOT_FOUND') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        setLoading(false);
        throw new Error('EMPLOYEE_NOT_FOUND');
      }
      setLoading(false);
    }
  };

  const login = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
