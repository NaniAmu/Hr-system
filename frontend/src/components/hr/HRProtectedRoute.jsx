import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HRProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || (user.role !== 'HR' && user.role !== 'ADMIN' && user.role !== 'HR_ADMIN')) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default HRProtectedRoute;
