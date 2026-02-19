/**
 * HR Controller
 * Handles HR-specific operations
 */

const Employee = require('../models/Employee');
const Department = require('../models/Department');

class HRController {
  /**
   * Get all employees (HR format)
   * GET /api/hr/employees
   * Requires: HR or ADMIN
   */
  async getEmployees(req, res) {
    try {
      // Fetch all employees with department populated
      const employees = await Employee.find({})
        .populate('departmentId', 'name code')
        .select('_id fullName email phone departmentId position profession status employeeCode')
        .sort({ fullName: 1 });

      // Transform to match frontend expectations
      const formattedEmployees = employees.map(emp => ({
        id: emp._id.toString(),
        fullName: emp.fullName,
        name: emp.fullName,
        email: emp.email,
        phone: emp.phone || '',
        departmentId: emp.departmentId?._id?.toString() || emp.departmentId?.toString() || null,
        department_name: emp.departmentId?.name || 'Unassigned',
        department: emp.departmentId?.name || 'Unassigned',
        jobTitle: emp.profession || emp.position || 'Not specified',
        position: emp.profession || emp.position || 'Not specified',
        employmentStatus: emp.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
        status: emp.status === 'ACTIVE' ? 'Active' : 'Inactive',
        employeeCode: emp.employeeCode || ''
      }));

      res.json({
        success: true,
        data: {
          employees: formattedEmployees
        }
      });
    } catch (error) {
      console.error('Error fetching HR employees:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch employees',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get all departments (HR format)
   * GET /api/hr/departments
   * Requires: HR or ADMIN
   */
  async getDepartments(req, res) {
    try {
      const departments = await Department.find()
        .populate('headEmployeeId', 'fullName email')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Error fetching HR departments:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch departments',
        action: 'Contact administrator'
      });
    }
  }
}

module.exports = new HRController();
