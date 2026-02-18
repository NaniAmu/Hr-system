/**
 * Employee Controller
 * Handles employee-related operations
 */

const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const { generateEmployeeCode } = require('../utils/employeeCode');
const { autoCreateEmployee } = require('../services/employeeService');
const { validationResult } = require('express-validator');

class EmployeeController {
  /**
   * Create a new employee
   * POST /api/employees
   * Requires: HR only
   * NOTE: This creates employee for existing user
   */
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        userId,
        fullName,
        email,
        phone,
        departmentId,
        position
      } = req.body;

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          action: 'Create user first'
        });
      }

      // Check if employee already exists for this user
      const existingEmployee = await Employee.findOne({ userId });
      if (existingEmployee) {
        return res.status(400).json({
          code: 'EMPLOYEE_EXISTS',
          message: 'Employee record already exists for this user',
          action: 'Update existing employee'
        });
      }

      // Department may be assigned later. If provided, validate it exists.
      let department = null;
      if (departmentId) {
        department = await Department.findById(departmentId);
        if (!department) {
          return res.status(400).json({
            code: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found',
            action: 'Provide valid department ID'
          });
        }
      }

      // Check if email already exists
      const existingEmail = await Employee.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        return res.status(400).json({
          code: 'EMAIL_EXISTS',
          message: 'Employee with this email already exists',
          action: 'Use different email'
        });
      }

      // Generate unique employee code
      const employeeCode = await generateEmployeeCode();

      // Create employee
      const employee = new Employee({
        userId,
        role: user.role,
        employeeCode,
        fullName,
        email: email.toLowerCase(),
        phone,
        departmentId: departmentId || null,
        position: position || null,
        status: 'ACTIVE',
        hiredAt: new Date()
      });

      await employee.save();
      if (employee.departmentId) {
        await employee.populate('departmentId', 'name code');
      }
      await employee.populate('userId', 'email role');

      // Format response for Helpdesk integration
      const formattedEmployee = {
        userId: employee.userId?._id?.toString() || employee.userId?.toString() || null,
        id: employee._id.toString(),
        name: employee.fullName,
        email: employee.email,
        phone: employee.phone || null,
        departmentId: employee.departmentId?._id?.toString() || employee.departmentId?.toString() || null,
        departmentName: employee.departmentId?.name || null,
        role: employee.userId?.role || null,
        status: employee.status.toLowerCase(),
        position: employee.position || null,
        employeeCode: employee.employeeCode
      };

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: formattedEmployee
      });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create employee',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Update employee
   * PUT /api/employees/:id
   * Requires: HR only
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        fullName,
        email,
        phone,
        departmentId,
        position,
        role
      } = req.body;

      // Find employee
      const employee = await Employee.findById(id);
      if (!employee) {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check employee ID'
        });
      }

      // Check if email already exists (if changed)
      if (email && email.toLowerCase() !== employee.email) {
        const existing = await Employee.findOne({
          email: email.toLowerCase(),
          _id: { $ne: id }
        });

        if (existing) {
          return res.status(400).json({
            code: 'EMAIL_EXISTS',
            message: 'Employee with this email already exists',
            action: 'Use different email'
          });
        }
      }

      // Validate department if provided
      if (departmentId && departmentId !== employee.departmentId?.toString()) {
        const department = await Department.findById(departmentId);
        if (!department) {
          return res.status(400).json({
            code: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found',
            action: 'Provide valid department ID'
          });
        }
      }

      // Update fields
      if (fullName) employee.fullName = fullName;
      if (email) employee.email = email.toLowerCase();
      if (phone !== undefined) employee.phone = phone;
      if (departmentId) employee.departmentId = departmentId;
      if (position) employee.position = position;

      await employee.save();

      // Sync with User record if email or role changed
      if (employee.userId) {
        const user = await User.findById(employee.userId);
        if (user) {
          let userUpdated = false;

          if (email && user.email !== email.toLowerCase()) {
            user.email = email.toLowerCase();
            userUpdated = true;
          }

          // Update role if provided and different
          // NOTE: Role update might require ADMIN privileges in a stricter system,
          // but for now HR can update roles.
          if (role && user.role !== role) {
            user.role = role;
            userUpdated = true;
          }

          if (userUpdated) {
            await user.save();
          }
        }
      }

      // Populate for response
      await employee.populate('userId', 'email role');
      if (employee.departmentId) {
        await employee.populate('departmentId', 'name code');
      }

      // Format response
      const formattedEmployee = {
        userId: employee.userId?._id?.toString() || employee.userId?.toString() || null,
        id: employee._id.toString(),
        name: employee.fullName,
        email: employee.email,
        phone: employee.phone || null,
        departmentId: employee.departmentId?._id?.toString() || employee.departmentId?.toString() || null,
        departmentName: employee.departmentId?.name || null,
        role: employee.userId?.role || null,
        status: employee.status.toLowerCase(),
        position: employee.position || null,
        employeeCode: employee.employeeCode
      };

      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: formattedEmployee
      });

    } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to update employee',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get current user's employee profile
   * GET /api/employees/me
   */
  async getMe(req, res) {
    try {
      // Mandatory 1:1 User <-> Employee. Never return EMPLOYEE_RECORD_MISSING for a valid user.
      let employee = null;

      if (req.user.employeeId) {
        employee = await Employee.findById(req.user.employeeId)
          .populate('departmentId', 'name code')
          .populate('userId', 'email role');
      }

      // Failsafe: find by userId (token may have been issued before employee existed)
      if (!employee && req.user.userId) {
        employee = await Employee.findOne({ userId: req.user.userId, status: 'ACTIVE' })
          .populate('departmentId', 'name code')
          .populate('userId', 'email role');
      }

      // Self-heal: auto-create if still missing
      if (!employee && req.user.userId) {
        const user = await User.findById(req.user.userId);
        if (user) {
          employee = await autoCreateEmployee(user, {
            fullName: user.email.split('@')[0] || 'User'
          });
          await employee.populate('userId', 'email role');
          if (employee.departmentId) {
            await employee.populate('departmentId', 'name code');
          }
        }
      }

      if (!employee) {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check account configuration'
        });
      }

      res.json({
        success: true,
        data: employee
      });
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch employee profile',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get employee by ID
   * GET /api/employees/:id
   * Used by Helpdesk for employee detail view
   */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id)
        .populate('departmentId', 'name code')
        .populate('userId', 'email role');

      if (!employee) {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check employee ID'
        });
      }

      // Task stats + workload (dynamic)
      const taskStats = {
        openTasks: employee.openTasks || 0,
        inProgressTasks: employee.inProgressTasks || 0
      };

      // Format response for Profile/Helpdesk integration
      const formattedEmployee = {
        userId: employee.userId?._id?.toString() || employee.userId?.toString() || null,
        id: employee._id.toString(),
        name: employee.fullName,
        email: employee.email,
        phone: employee.phone || null,
        departmentId: employee.departmentId?._id?.toString() || employee.departmentId?.toString() || null,
        departmentName: employee.departmentId?.name || null,
        role: employee.userId?.role || null,
        status: employee.status.toLowerCase(), // "active" or "inactive"
        profession: employee.profession || null,
        position: employee.position || null,
        employeeCode: employee.employeeCode,
        hiredAt: employee.hiredAt,
        taskStats,
        workloadScore: employee.workloadScore
      };

      res.json({
        success: true,
        data: formattedEmployee
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      
      // Handle invalid ObjectId format
      if (error.name === 'CastError') {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check employee ID format'
        });
      }

      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch employee',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get employee workload
   * GET /api/employees/:id/workload
   */
  async getWorkload(req, res) {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(id).select('openTasks inProgressTasks status');

      if (!employee) {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check employee ID'
        });
      }

      res.json({
        success: true,
        data: {
          employeeId: employee._id.toString(),
          openTasks: employee.openTasks || 0,
          inProgressTasks: employee.inProgressTasks || 0,
          workloadScore: employee.workloadScore
        }
      });
    } catch (error) {
      console.error('Error fetching employee workload:', error);
      if (error.name === 'CastError') {
        return res.status(404).json({
          code: 'EMPLOYEE_NOT_FOUND',
          message: 'Employee not found',
          action: 'Check employee ID format'
        });
      }
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch workload',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get all employees (with optional departmentId filter)
   * GET /api/employees?departmentId=<id>
   * Used by Helpdesk for department employee lookup
   */
  async getAll(req, res) {
    try {
      const { departmentId } = req.query;

      let query = { status: 'ACTIVE' };
      
      if (departmentId) {
        // Validate department exists
        const department = await Department.findById(departmentId);
        if (!department) {
          return res.status(404).json({
            code: 'DEPARTMENT_NOT_FOUND',
            message: 'Department not found',
            action: 'Check department ID'
          });
        }
        query.departmentId = departmentId;
      }

      // Get employees
      const employees = await Employee.find(query)
        .populate('userId', 'email role')
        .populate('departmentId', 'name code')
        .sort({ fullName: 1 });

      // Format response for Helpdesk integration
      const formattedEmployees = employees.map(emp => ({
        userId: emp.userId?._id?.toString() || emp.userId?.toString() || null,
        id: emp._id.toString(),
        name: emp.fullName,
        email: emp.email,
        phone: emp.phone || null,
        departmentId: emp.departmentId?._id?.toString() || emp.departmentId?.toString() || null,
        departmentName: emp.departmentId?.name || null,
        role: emp.userId?.role || null,
        status: emp.status.toLowerCase(), // "active" or "inactive"
        position: emp.position,
        employeeCode: emp.employeeCode
      }));

      // Return array directly for frontend .map() compatibility
      res.json(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch employees',
        action: 'Contact administrator'
      });
    }
  }

  /**
   * Get employees by department (path parameter)
   * GET /api/employees/department/:departmentId
   */
  async getByDepartment(req, res) {
    try {
      const { departmentId } = req.params;

      // Validate department exists
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(404).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found',
          action: 'Check department ID'
        });
      }

      // Get employees in department
      const employees = await Employee.find({
        departmentId,
        status: 'ACTIVE'
      })
        .populate('userId', 'email role')
        .populate('departmentId', 'name code')
        .sort({ fullName: 1 });

      // Format response for Helpdesk integration
      const formattedEmployees = employees.map(emp => ({
        userId: emp.userId?._id?.toString() || emp.userId?.toString() || null,
        id: emp._id.toString(),
        name: emp.fullName,
        email: emp.email,
        phone: emp.phone || null,
        departmentId: emp.departmentId?._id?.toString() || emp.departmentId?.toString() || null,
        departmentName: emp.departmentId?.name || null,
        role: emp.userId?.role || null,
        status: emp.status.toLowerCase(),
        profession: emp.profession || null,
        position: emp.position || null,
        taskStats: {
          openTasks: emp.openTasks || 0,
          inProgressTasks: emp.inProgressTasks || 0
        },
        workloadScore: emp.workloadScore,
        employeeCode: emp.employeeCode
      }));

      res.json({
        success: true,
        data: {
          department: {
            id: department._id,
            name: department.name,
            code: department.code
          },
          employees: formattedEmployees,
          count: formattedEmployees.length
        }
      });
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch employees',
        action: 'Contact administrator'
      });
    }
  }
}

module.exports = new EmployeeController();
