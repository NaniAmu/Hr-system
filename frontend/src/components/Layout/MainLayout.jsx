import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Header from '../Header';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '../../contexts/AuthContext';

// MainLayout wraps the app's primary UI with Sidebar, optional Topbar, and an Outlet for nested routes
// It is resilient: child errors won't crash the whole app due to nested ErrorBoundary
const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
