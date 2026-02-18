import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { hrService } from '../../services/hrService';

const HRDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    departmentsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await hrService.getDashboardStats();
      
      if (data.data) {
        setStats({
          totalEmployees: data.data.totalEmployees || 0,
          activeEmployees: data.data.activeEmployees || 0,
          departmentsCount: data.data.departmentsCount || 0
        });
      } else {
        // Fallback: fetch from individual endpoints
        const [employeesRes, departmentsRes] = await Promise.all([
          hrService.getEmployees(),
          hrService.getDepartments()
        ]);
        
        const employees = Array.isArray(employeesRes) ? employeesRes : [];
        const activeEmployees = employees.filter(
          (e) => e.status === 'ACTIVE' || e.employmentStatus === 'ACTIVE'
        ).length;
        
        setStats({
          totalEmployees: employees.length,
          activeEmployees,
          departmentsCount: Array.isArray(departmentsRes) ? departmentsRes.length : 0
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">HR Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/hr/employees')}
                className="text-gray-700 hover:text-gray-900"
              >
                Employees
              </button>
              <button
                onClick={() => navigate('/hr/departments')}
                className="text-gray-700 hover:text-gray-900"
              >
                Departments
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">HR Dashboard</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Total Employees</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Active Employees</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeEmployees}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-500 mb-2">Departments</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.departmentsCount}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HRDashboard;
