/**
 * Public API Routes
 * For Helpdesk system integration
 * No authentication required (or use API key in production)
 */

const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Department = require('../models/Department');

/**
 * Get employee by user ID
 * GET /api/public/employees/:userId
 * Used by Helpdesk to validate employees
 */
router.get('/employees/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const employee = await Employee.findOne({ userId })
      .populate('departmentId', 'name code')
      .populate('userId', 'email role');

    if (!employee) {
      return res.status(404).json({
        code: 'EMPLOYEE_NOT_FOUND',
        message: 'Employee not found for this user',
        action: 'Check user ID'
      });
    }

    // Format response for Helpdesk
    res.json({
      employeeId: employee._id,
      employeeCode: employee.employeeCode,
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      department: employee.departmentId?.name || null,
      departmentCode: employee.departmentId?.code || null,
      position: employee.position,
      status: employee.status
    });
  } catch (error) {
    console.error('Error fetching employee by user ID:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch employee',
      action: 'Contact administrator'
    });
  }
});

/**
 * Get employees by department
 * GET /api/public/departments/:id/employees
 * Used by Helpdesk to load employee lists for task assignment
 */
router.get('/departments/:id/employees', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate department exists
    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        code: 'DEPARTMENT_NOT_FOUND',
        message: 'Department not found',
        action: 'Check department ID'
      });
    }

    // Get active employees in department
    const employees = await Employee.find({
      departmentId: id,
      status: 'ACTIVE'
    })
      .select('employeeCode fullName email phone position')
      .sort({ fullName: 1 });

    // Format response for Helpdesk
    res.json({
      department: {
        id: department._id,
        name: department.name,
        code: department.code
      },
      employees: employees.map(emp => ({
        employeeId: emp._id,
        employeeCode: emp.employeeCode,
        fullName: emp.fullName,
        email: emp.email,
        phone: emp.phone,
        position: emp.position
      }))
    });
  } catch (error) {
    console.error('Error fetching department employees:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch employees',
      action: 'Contact administrator'
    });
  }
});
    
    /**
 * Get all departments
 * GET /api/public/departments
 * Used by Helpdesk for department selection
 */
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .select('name code')
      .sort({ name: 1 });

    res.json(departments.map(d => ({
      _id: d._id,
      name: d.name,
      code: d.code
    })));
  } catch (error) {
    console.error('Error fetching public departments:', error);
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Failed to fetch departments'
    });
  }
});

module.exports = router;
