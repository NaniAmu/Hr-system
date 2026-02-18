import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  UserX,
  UserCheck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';

const EmployeesList = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    departmentId: ''
  });

  // Get JWT token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch departments from backend
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3002/api/departments',
        { headers: getAuthHeader() }
      );
      
      console.log('Departments response:', response.data);
      
      // Handle various response formats
      let departmentsList = [];
      if (Array.isArray(response.data)) {
        departmentsList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        departmentsList = response.data.data;
      } else if (response.data?.data?.departments && Array.isArray(response.data.data.departments)) {
        departmentsList = response.data.data.departments;
      }
      
      setDepartments(departmentsList);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(
        'http://localhost:3002/api/employees',
        { headers: getAuthHeader() }
      );
      
      console.log('Employees response:', response.data);
      
      // Handle various response formats
      let employeesList = [];
      if (Array.isArray(response.data)) {
        employeesList = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        employeesList = response.data.data;
      } else if (response.data?.data?.employees && Array.isArray(response.data.data.employees)) {
        employeesList = response.data.data.employees;
      }
      
      setEmployees(employeesList);
    } catch (err) {
      console.error('Error fetching employees:', err);
      const message = err?.response?.data?.message || 
                     err?.response?.data?.error || 
                     err?.message || 
                     'Failed to load employees';
      setError(message);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  // Open modal for creating new employee
  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        fullName: employee?.fullName || employee?.name || '',
        email: employee?.email || '',
        password: '',
        phone: employee?.phone || '',
        departmentId: employee?.departmentId || '',
        position: employee?.position || ''
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        position: '',
        departmentId: ''
      });
    }
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormError(null);
      setFormSuccess(null);
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.departmentId || !formData.position) {
        setFormError('Full Name, Email, Department, and Position are required');
        setIsSubmitting(false);
        return;
      }

      // For new employees, password is required
      if (!editingEmployee && !formData.password) {
        setFormError('Password is required for new employees');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        departmentId: formData.departmentId,
        position: formData.position
      };

      // Add password for new employees
      if (!editingEmployee) {
        payload.password = formData.password;
        payload.role = 'EMPLOYEE';
      }

      console.log('Submitting payload:', payload);

      if (editingEmployee) {
        // Update existing employee
        await axios.put(
          `http://localhost:3002/api/employees/${editingEmployee.id || editingEmployee._id}`,
          payload,
          { headers: getAuthHeader() }
        );
        setFormSuccess('Employee updated successfully');
      } else {
        // Create new employee - use registration endpoint
        await axios.post(
          'http://localhost:3002/api/auth/register',
          payload,
          { headers: getAuthHeader() }
        );
        setFormSuccess('Employee created successfully');
      }

      // Close modal and refresh list after a short delay
      setTimeout(() => {
        setIsModalOpen(false);
        fetchEmployees();
      }, 1500);

    } catch (err) {
      console.error('Error saving employee:', err);
      
      // Extract error message from various response formats
      let errorMessage = 'Failed to save employee. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.code) {
        // Handle specific error codes
        const code = err.response.data.code;
        if (code === 'EMAIL_EXISTS' || code === 'EMPLOYEE_EXISTS') {
          errorMessage = 'An employee with this email already exists';
        } else if (code === 'DEPARTMENT_NOT_FOUND') {
          errorMessage = 'Selected department not found';
        } else if (code === 'MISSING_FIELDS') {
          errorMessage = 'Please fill in all required fields';
        } else {
          errorMessage = err.response.data.message || errorMessage;
        }
      } else if (typeof err.response?.data === 'string') {
        errorMessage = err.response.data;
      }
      
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (employee) => {
    try {
      const newStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
      await axios.put(
        `http://localhost:3002/api/employees/${employee.id || employee._id}`,
        { ...employee, status: newStatus },
        { headers: getAuthHeader() }
      );
      fetchEmployees();
    } catch (err) {
      console.error('Error toggling status:', err);
      setError('Failed to update employee status');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="main container mx-auto flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main container mx-auto space-y-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view all your team members</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Employee
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Employees table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Search and filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Empty state */}
        {Array.isArray(employees) && employees.length === 0 && (
          <div className="flex justify-center items-center h-32 text-gray-500">
            <p className="text-center">
              <p className="font-medium">No employees found</p>
              <p className="text-sm mt-1">Click "Add Employee" to create one</p>
            </p>
          </div>
        )}

        {/* Table */}
        {Array.isArray(employees) && employees.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id || employee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                          {(employee?.fullName || employee?.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-gray-900">
                            {employee?.fullName || employee?.name || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee?.email || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee?.departmentName || employee?.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee?.position || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        (employee?.status === 'Active' || employee?.status === 'ACTIVE')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee?.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(employee)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleStatusToggle(employee)}
                          className={`p-1 rounded transition-colors ${
                            (employee?.status === 'Active' || employee?.status === 'ACTIVE')
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={
                            (employee?.status === 'Active' || employee?.status === 'ACTIVE')
                              ? 'Deactivate'
                              : 'Activate'
                          }
                        >
                          {(employee?.status === 'Active' || employee?.status === 'ACTIVE') ? (
                            <UserX size={18} />
                          ) : (
                            <UserCheck size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingEmployee ? 'Edit Employee' : 'Create New Employee'}
              </h2>

              {/* Success message */}
              {formSuccess && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-green-700 flex items-start gap-3">
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{formSuccess}</p>
                </div>
              )}

              {/* Error message */}
              {formError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-start gap-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Password - only for new employees */}
                {!editingEmployee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      type="password"
                      required={!editingEmployee}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    required
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept._id || dept.id} value={dept._id || dept.id}>
                        {dept.name || dept.departmentName || `Department ${dept._id || dept.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Software Engineer"
                  />
                </div>

                {/* Form actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesList;
