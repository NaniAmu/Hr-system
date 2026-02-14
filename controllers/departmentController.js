/**
 * Department Controller
 * Handles department-related operations
 */

const Department = require('../models/Department');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class DepartmentController {
  /**
   * Create a new department
   * POST /api/departments
   * Requires: ADMIN or HR
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, code } = req.body;

      // Check if code already exists
      const existing = await Department.findOne({ code: code.toUpperCase() });
      if (existing) {
        return res.status(400).json({
          code: 'DEPARTMENT_CODE_EXISTS',
          message: 'Department code already exists',
          action: 'Use different code'
        });
      }

      const department = new Department({
        name,
        code: code.toUpperCase()
      });

      await department.save();

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department
      });
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create department',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get all departments
   * GET /api/departments
   */
  async getAll(req, res) {
    try {
      const departments = await Department.find()
        .populate('headEmployeeId', 'fullName email employeeCode')
        .sort({ name: 1 });

      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch departments',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get department by ID
   * GET /api/departments/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const department = await Department.findById(id)
        .populate('headEmployeeId', 'fullName email employeeCode')
        .populate({
          path: 'headEmployeeId',
          populate: {
            path: 'departmentId',
            select: 'name code'
          }
        });

      if (!department) {
        return res.status(404).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found',
          action: 'Check department ID'
        });
      }

      res.json({
        success: true,
        data: department
      });
    } catch (error) {
      console.error('Error fetching department:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch department',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Assign department head
   * PUT /api/departments/:id/head
   * Requires: ADMIN or HR
   */
  async assignHead(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { headEmployeeId } = req.body;

      // Find department
      const department = await Department.findById(id);
      if (!department) {
        return res.status(404).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found',
          action: 'Check department ID'
        });
      }

      // Validate employee exists
      const employee = await Employee.findById(headEmployeeId);
      if (!employee) {
        return res.status(400).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check employee ID'
        });
      }

      // Ensure department head is linked to this department
      // Department head MUST also belong to the department.
      if (!employee.departmentId || employee.departmentId.toString() !== id) {
        employee.departmentId = department._id;
        await employee.save();
      }

      // Update department head
      department.headEmployeeId = headEmployeeId;
      await department.save();

      // Update user role to DEPARTMENT_HEAD if not already
      const user = await User.findById(employee.userId);
      if (user && user.role !== 'DEPARTMENT_HEAD') {
        user.role = 'DEPARTMENT_HEAD';
        await user.save();
      }

      await department.populate('headEmployeeId', 'fullName email employeeCode');

      res.json({
        success: true,
        message: 'Department head assigned successfully',
        data: department
      });
    } catch (error) {
      console.error('Error assigning department head:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to assign department head',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get employees in the current department head's department
   * GET /api/departments/my/employees
   * Requires: DEPARTMENT_HEAD (or higher via RBAC)
   */
  async getMyEmployees(req, res) {
    try {
      const userId = req.user?.userId;

      // Find employee record for current user
      const employee = await Employee.findOne({
        userId,
        status: 'ACTIVE'
      });

      if (!employee) {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check account configuration'
        });
      }

      // If no department is assigned, treat as no employees yet (not an error)
      if (!employee.departmentId) {
        return res.json({
          success: true,
          message: 'No employees assigned to this department yet',
          data: {
            employees: [],
            count: 0
          }
        });
      }

      const departmentId = employee.departmentId;

      // Get all employees in the same department (exclude inactive)
      const employees = await Employee.find({
        departmentId,
        status: { $ne: 'INACTIVE' }
      }).select('fullName email phone role position');

      if (!employees.length) {
        return res.json({
          success: true,
          message: 'No employees assigned to this department yet',
          data: {
            employees: [],
            count: 0
          }
        });
      }

      const formatted = employees.map(emp => ({
        name: emp.fullName,
        email: emp.email,
        phone: emp.phone || null,
        role: emp.role,
        position: emp.position || null
      }));

      res.json({
        success: true,
        data: {
          employees: formatted,
          count: formatted.length
        }
      });
    } catch (error) {
      console.error('Error fetching department employees for current user:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch department employees',
        action: 'Contact administrator'
      });
    }
  }
}

module.exports = new DepartmentController();
