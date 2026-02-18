import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import DepartmentForm from '../../components/hr/DepartmentForm';

const Departments = () => {
  const { logout } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch departments
      console.log('[DEPARTMENTS] Fetching departments...');
      const departmentsRes = await api.get('/departments');
      console.log('[DEPARTMENTS] Response received:', departmentsRes.data);

      // Extract departments array from various possible response shapes
      let safeDepartments = [];
      if (Array.isArray(departmentsRes.data)) {
        safeDepartments = departmentsRes.data;
      } else if (Array.isArray(departmentsRes.data?.data)) {
        safeDepartments = departmentsRes.data.data;
      } else if (departmentsRes.data && typeof departmentsRes.data === 'object') {
        console.warn('[DEPARTMENTS] Unexpected response shape:', departmentsRes.data);
        safeDepartments = [];
      }

      // Fetch employees
      console.log('[DEPARTMENTS] Fetching employees...');
      const employeesRes = await api.get('/employees');
      console.log('[DEPARTMENTS] Employees response received:', employeesRes.data);

      // Extract employees array from various possible response shapes
      let safeEmployees = [];
      if (Array.isArray(employeesRes.data)) {
        safeEmployees = employeesRes.data;
      } else if (Array.isArray(employeesRes.data?.data)) {
        safeEmployees = employeesRes.data.data;
      } else if (employeesRes.data && typeof employeesRes.data === 'object') {
        console.warn('[DEPARTMENTS] Unexpected employees response shape:', employeesRes.data);
        safeEmployees = [];
      }

      // Ensure arrays are valid
      setDepartments(Array.isArray(safeDepartments) ? safeDepartments : []);
      setEmployees(Array.isArray(safeEmployees) ? safeEmployees : []);
      console.log('[DEPARTMENTS] State updated successfully');
    } catch (err) {
      console.error('[DEPARTMENTS] Error fetching data:', err);
      
      // Handle 401 errors
      if (err.response?.status === 401) {
        console.error('[DEPARTMENTS] Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      setDepartments([]);
      setEmployees([]);
      setError(err.response?.data?.message || 'Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormOpen(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      console.log('[DEPARTMENTS] Creating/updating department');
      await api.post('/api/departments', formData);

      if (formData.headEmployeeId && editingDepartment) {
        const deptId = editingDepartment._id || editingDepartment.id;
        console.log('[DEPARTMENTS] Assigning department head:', deptId);
        await api.put(`/api/departments/${deptId}/head`, {
          headEmployeeId: formData.headEmployeeId
        });
      }

      handleCloseForm();
      await fetchData();
    } catch (err) {
      console.error('[DEPARTMENTS] Error saving department:', err);
      setError(err?.response?.data?.message || 'Failed to save department. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading departments...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">HR - Departments</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
                <Link to="/employees" className="text-gray-700 hover:text-gray-900">Employees</Link>
                <button onClick={logout} className="text-gray-700 hover:text-gray-900">Logout</button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Departments</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Success render
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">HR - Departments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link to="/employees" className="text-gray-700 hover:text-gray-900">Employees</Link>
              <button onClick={logout} className="text-gray-700 hover:text-gray-900">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Departments Management</h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Department
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {Array.isArray(departments) && departments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Head
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((dept) => (
                  <tr key={dept?._id || dept?.id || Math.random()} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dept?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept?.code || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dept?.headEmployee?.fullName || dept?.headEmployeeId?.fullName || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(dept)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No departments found</p>
              <p className="text-sm mt-1">Click "Add Department" to create one</p>
            </div>
          )}
        </div>

        {formOpen && (
          <DepartmentForm
            department={editingDepartment}
            employees={Array.isArray(employees) ? employees : []}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        )}
      </main>
    </div>
  );
};

export default Departments;
