import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import EmployeeTable from '../../components/hr/EmployeeTable';
import EmployeeForm from '../../components/hr/EmployeeForm';
import { AlertCircle } from 'lucide-react';

const Employees = () => {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Get JWT token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch employees
      console.log('[EMPLOYEES] Fetching employees...');
      const employeesRes = await axios.get(
        'http://localhost:3002/api/employees',
        { headers: getAuthHeader() }
      );
      console.log('[EMPLOYEES] Response received:', employeesRes.data);

      // Extract employees array from various possible response shapes
      let safeEmployees = [];
      if (Array.isArray(employeesRes.data)) {
        safeEmployees = employeesRes.data;
      } else if (Array.isArray(employeesRes.data?.data)) {
        safeEmployees = employeesRes.data.data;
      } else if (employeesRes.data && typeof employeesRes.data === 'object') {
        console.warn('[EMPLOYEES] Unexpected response shape:', employeesRes.data);
        safeEmployees = [];
      }

      // Fetch departments
      console.log('[EMPLOYEES] Fetching departments...');
      const departmentsRes = await axios.get(
        'http://localhost:3002/api/departments',
        { headers: getAuthHeader() }
      );
      console.log('[EMPLOYEES] Departments response received:', departmentsRes.data);

      // Extract departments array from various possible response shapes
      let safeDepartments = [];
      if (Array.isArray(departmentsRes.data)) {
        safeDepartments = departmentsRes.data;
      } else if (Array.isArray(departmentsRes.data?.data)) {
        safeDepartments = departmentsRes.data.data;
      } else if (departmentsRes.data?.data?.departments && Array.isArray(departmentsRes.data.data.departments)) {
        safeDepartments = departmentsRes.data.data.departments;
      } else if (departmentsRes.data && typeof departmentsRes.data === 'object') {
        console.warn('[EMPLOYEES] Unexpected departments response shape:', departmentsRes.data);
        safeDepartments = [];
      }

      // Ensure arrays are valid
      setEmployees(Array.isArray(safeEmployees) ? safeEmployees : []);
      setDepartments(Array.isArray(safeDepartments) ? safeDepartments : []);
      console.log('[EMPLOYEES] State updated successfully');
    } catch (err) {
      console.error('[EMPLOYEES] Error fetching data:', err);
      
      // Handle 401 errors
      if (err.response?.status === 401) {
        console.error('[EMPLOYEES] Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      setEmployees([]);
      setDepartments([]);
      setError(err.response?.data?.message || 'Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEmployee(null);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setError(null);

      if (editingEmployee) {
        const empId = editingEmployee.id || editingEmployee._id;
        console.log('[EMPLOYEES] Updating employee:', empId);
        await axios.put(
          `http://localhost:3002/api/employees/${empId}`,
          formData,
          { headers: getAuthHeader() }
        );
      } else {
        console.log('[EMPLOYEES] Creating new employee');
        await axios.post(
          'http://localhost:3002/api/auth/register',
          formData,
          { headers: getAuthHeader() }
        );
      }

      handleCloseForm();
      await fetchData();
    } catch (err) {
      console.error('[EMPLOYEES] Error saving employee:', err);
      
      // Extract error message
      let errorMessage = 'Failed to save employee. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.code) {
        const code = err.response.data.code;
        if (code === 'EMAIL_EXISTS' || code === 'EMPLOYEE_EXISTS') {
          errorMessage = 'An employee with this email already exists';
        } else if (code === 'DEPARTMENT_NOT_FOUND') {
          errorMessage = 'Selected department not found';
        } else if (code === 'MISSING_FIELDS') {
          errorMessage = 'Please fill in all required fields';
        }
      }
      
      setError(errorMessage);
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
          <p className="text-gray-600 font-medium">Loading employees...</p>
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
                <h1 className="text-xl font-semibold text-gray-900">HR - Employees</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
                <Link to="/departments" className="text-gray-700 hover:text-gray-900">Departments</Link>
                <button onClick={logout} className="text-gray-700 hover:text-gray-900">Logout</button>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Employees</h2>
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
              <h1 className="text-xl font-semibold text-gray-900">HR - Employees</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900">Dashboard</Link>
              <Link to="/departments" className="text-gray-700 hover:text-gray-900">Departments</Link>
              <button onClick={logout} className="text-gray-700 hover:text-gray-900">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Employees Management</h2>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Employee
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          {Array.isArray(employees) && employees.length > 0 ? (
            <EmployeeTable employees={employees} onEdit={handleEdit} />
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium">No employees found</p>
              <p className="text-sm mt-1">Click "Add Employee" to create one</p>
            </div>
          )}
        </div>

        {formOpen && (
          <EmployeeForm
            employee={editingEmployee}
            departments={Array.isArray(departments) ? departments : []}
            onClose={handleCloseForm}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        )}
      </main>
    </div>
  );
};

export default Employees;
