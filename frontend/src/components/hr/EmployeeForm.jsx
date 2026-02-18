import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const EmployeeForm = ({ employee, departments, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    departmentId: '',
    position: '',
    role: 'EMPLOYEE',
    status: 'ACTIVE'
  });

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Get JWT token from localStorage
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        fullName: employee.fullName || employee.name || '',
        email: employee.email || '',
        password: '',
        phone: employee.phone || '',
        departmentId: employee.departmentId || employee.department?._id || '',
        position: employee.position || '',
        role: employee.role || employee.roleType || 'EMPLOYEE',
        status: employee.status || employee.employmentStatus || 'ACTIVE'
      });
    }
  }, [employee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.departmentId || !formData.position) {
        setFormError('Full Name, Email, Department, and Position are required');
        return;
      }

      // For new employees, password is required
      if (!employee && !formData.password) {
        setFormError('Password is required for new employees');
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
      if (!employee) {
        payload.password = formData.password;
        payload.role = formData.role;
      }

      console.log('Submitting employee form:', payload);

      if (employee) {
        // Update existing employee
        await axios.put(
          `http://localhost:3002/api/employees/${employee.id || employee._id}`,
          payload,
          { headers: getAuthHeader() }
        );
        setFormSuccess('Employee updated successfully');
      } else {
        // Create new employee using registration endpoint
        await axios.post(
          'http://localhost:3002/api/auth/register',
          payload,
          { headers: getAuthHeader() }
        );
        setFormSuccess('Employee created successfully');
      }

      // Call parent onSubmit callback
      if (onSubmit) {
        onSubmit(formData);
      }

      // Close modal after success
      setTimeout(() => {
        onClose();
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
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">
            {employee ? 'Edit Employee' : 'Create New Employee'}
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
            {!employee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required={!employee}
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

            {/* Role - only for new employees */}
            {!employee && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="HR">HR</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            )}

            {/* Status - only for existing employees */}
            {employee && (
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.status === 'ACTIVE'}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.checked ? 'ACTIVE' : 'INACTIVE' })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            )}

            {/* Form actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : employee ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
