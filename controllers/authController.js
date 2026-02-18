/**
 * Authentication Controller
 * Handles user registration and login
 * Safe version for standalone MongoDB (no transactions)
 */

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { generateToken } = require('../utils/jwt');
const { generateEmployeeCode } = require('../utils/employeeCode');
const { validationResult } = require('express-validator');

class AuthController {
  /**
   * REGISTER
   */
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, role, fullName, phone, departmentId, position } = req.body;

      if (!email || !password || !departmentId || !position || !fullName) {
        return res.status(400).json({
          code: 'MISSING_FIELDS',
          message: 'Email, password, fullName, departmentId and position are required'
        });
      }

      const lowerEmail = email.toLowerCase();

      // Check duplicate user
      if (await User.findOne({ email: lowerEmail })) {
        return res.status(400).json({
          code: 'EMAIL_EXISTS',
          message: 'User already exists'
        });
      }

      // Check duplicate employee
      if (await Employee.findOne({ email: lowerEmail })) {
        return res.status(400).json({
          code: 'EMPLOYEE_EXISTS',
          message: 'Employee already exists with this email'
        });
      }

      // Validate department
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        });
      }

      // Create User (authentication only)
      const user = new User({
        email: lowerEmail,
        password,
        role: role || 'EMPLOYEE',
        isActive: true
      });
      await user.save();

      // Create Employee (profile data)
      const employeeCode = await generateEmployeeCode();
      const employee = new Employee({
        userId: user._id,
        role: user.role,
        employeeCode,
        fullName,
        email: lowerEmail,
        phone,
        departmentId,
        position,
        status: 'ACTIVE',
        hiredAt: new Date()
      });
      await employee.save();

      // Generate token
      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
        employeeId: employee._id.toString(),
        departmentId: departmentId?.toString() || null,
        email: user.email
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id.toString(),
          employeeId: employee._id.toString(),
          role: user.role,
          departmentId: departmentId.toString(),
          email: user.email
        },
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.role
          },
          employee: {
            id: employee._id,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            department: department.name
          },
          token
        }
      });

    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          code: 'DUPLICATE_ENTRY',
          message: 'Duplicate email detected'
        });
      }

      console.error('Registration error:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user and employee'
      });
    }
  }

  /**
   * LOGIN
   */
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const lowerEmail = email.toLowerCase();

      const user = await User.findOne({ email: lowerEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          code: 'ACCOUNT_INACTIVE',
          message: 'Account is inactive'
        });
      }

      const isValid = await user.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        });
      }

      const employee = await Employee.findOne({
        userId: user._id,
        status: 'ACTIVE'
      }).populate('departmentId', 'name');

      const departmentId = employee?.departmentId?._id || employee?.departmentId || null;

      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
        employeeId: employee?._id?.toString() || null,
        departmentId: departmentId ? departmentId.toString() : null,
        email: user.email
      });

      const userPayload = {
        id: user._id.toString(),
        userId: user._id.toString(),
        employeeId: employee?._id?.toString() || user._id.toString(),
        role: user.role,
        departmentId: departmentId ? departmentId.toString() : null,
        email: user.email,
        name: employee?.fullName || user.email
      };

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userPayload,
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.role
          },
          employee: employee ? {
            id: employee._id,
            employeeCode: employee.employeeCode,
            fullName: employee.fullName,
            department: employee.departmentId?.name
          } : null,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to login'
      });
    }
  }
}

module.exports = new AuthController();
