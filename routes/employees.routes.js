/**
 * Employee Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { requireHR, canAccessEmployee } = require('../middleware/rbac');

// Validation rules
const employeeValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  // Department is optional at creation time; may be assigned later
  body('departmentId').optional().isString().withMessage('Department ID must be a string'),
  body('position').optional().isString().withMessage('Position must be a string')
];

// Create employee (HR only)
router.post(
  '/',
  authenticate,
  requireHR,
  employeeValidation,
  employeeController.create
);

// Update employee (HR only)
router.put(
  '/:id',
  authenticate,
  requireHR,
  [
    body('fullName').optional().notEmpty().withMessage('Full name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('departmentId').optional().isString(),
    body('position').optional().isString(),
    body('role').optional().isIn(['ADMIN', 'HR', 'DEPARTMENT_HEAD', 'EMPLOYEE']).withMessage('Invalid role')
  ],
  employeeController.update
);

// Get current user's employee profile
router.get(
  '/me',
  authenticate,
  employeeController.getMe
);

// Get employees (with optional departmentId query parameter)
// GET /api/employees?departmentId=<id>
router.get(
  '/',
  authenticate,
  employeeController.getAll
);

// Get employees by department (legacy path parameter support)
router.get(
  '/department/:departmentId',
  authenticate,
  employeeController.getByDepartment
);

// Get employees by department (requested path)
router.get(
  '/by-department/:departmentId',
  authenticate,
  employeeController.getByDepartment
);

// Get employee workload
router.get(
  '/:id/workload',
  authenticate,
  canAccessEmployee,
  employeeController.getWorkload
);

// Get employee by ID
router.get(
  '/:id',
  authenticate,
  canAccessEmployee,
  employeeController.getById
);

module.exports = router;
