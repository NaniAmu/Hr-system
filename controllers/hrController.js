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
        .select('_id fullName email phone departmentId position profession status')
        .sort({ fullName: 1 });

      // Transform to requested format
      const formattedEmployees = employees.map(emp => ({
        _id: emp._id.toString(),
        name: emp.fullName,
        email: emp.email,
        department: emp.departmentId?.name || 'Unassigned',
        position: emp.profession || emp.position || 'Not specified',
        status: emp.status === 'ACTIVE' ? 'Active' : 'Inactive'
      }));

      res.json(formattedEmployees);
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
