/**
 * Department Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const departmentController = require('../controllers/departmentController');
const registryController = require('../controllers/registryController');
const { authenticate } = require('../middleware/auth');
const { requireHR, requireDepartmentHead, canAccessDepartment } = require('../middleware/rbac');

// Validation rules
const departmentValidation = [
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required')
];

const assignHeadValidation = [
  body('headEmployeeId').notEmpty().withMessage('Head employee ID is required')
];

// Create department (ADMIN or HR)
router.post(
  '/',
  authenticate,
  requireHR,
  departmentValidation,
  departmentController.create
);

// Get all departments
router.get(
  '/',
  authenticate,
  departmentController.getAll
);

// Get employees in the current department head's department
router.get(
  '/my/employees',
  authenticate,
  requireDepartmentHead,
  departmentController.getMyEmployees
);

// Get department by ID
router.get(
  '/:id',
  authenticate,
  canAccessDepartment,
  departmentController.getById
);

// Department registry PDF (ADMIN/HR or department head's own department via canAccessDepartment)
router.get(
  '/:id/registry.pdf',
  authenticate,
  canAccessDepartment,
  registryController.departmentRegistryPdf
);

// Update department (ADMIN or HR)
router.put(
  '/:id',
  authenticate,
  requireHR,
  departmentValidation,
  departmentController.update
);

// Assign department head (ADMIN or HR)
router.put(
  '/:id/head',
  authenticate,
  requireHR,
  assignHeadValidation,
  departmentController.assignHead
);

module.exports = router;
