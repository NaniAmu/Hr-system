// controllers/UserController.js
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

class UserController {
  /**
   * Create a new user + employee
   * POST /api/users
   * Requires: ADMIN or HR
   */
  async create(req, res) {
    try {
      // 1. Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          code: 'VALIDATION_ERROR',
          message: 'Validation error',
          errors: errors.array() 
        });
      }

      const { email, password, role = 'EMPLOYEE', fullName, phone, departmentId, position } = req.body;

      // 2. Check required fields
      if (!email || !password || !fullName || !departmentId || !position) {
        return res.status(400).json({
          code: 'MISSING_FIELDS',
          message: 'Email, password, fullName, departmentId and position are required'
        });
      }

      // 3. Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          code: 'EMAIL_EXISTS',
          message: 'Email already exists'
        });
      }

      // 4. Check if department exists
      const department = await Department.findById(departmentId);
      if (!department) {
        return res.status(400).json({
          code: 'DEPARTMENT_NOT_FOUND',
          message: 'Department not found'
        });
      }

      // 5. Create user
      const user = new User({
        email,
        password,
        role,
        isActive: true
      });
      await user.save();

      // 6. Create employee linked to user
      const employee = new Employee({
        userId: user._id,
        fullName,
        phone: phone || null,
        departmentId,
        position,
        status: 'ACTIVE'
      });
      await employee.save();

      // 7. Return response
      res.status(201).json({
        success: true,
        message: 'User and employee created successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
            isActive: user.isActive
          },
          employee: {
            id: employee._id,
            fullName: employee.fullName,
            phone: employee.phone,
            department: {
              id: department._id,
              name: department.name,
              code: department.code
            },
            position: employee.position,
            status: employee.status
          }
        }
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        code: 'INTERNAL_ERROR',
        message: 'Failed to create user',
        action: 'Contact administrator'
      });
    }
  }
}

module.exports = new UserController();
