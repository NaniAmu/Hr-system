/**
 * HR Routes
 * Routes for HR-specific operations
 */

const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { authenticate } = require('../middleware/auth');
const { requireHR } = require('../middleware/rbac');

// All HR routes require authentication and HR/ADMIN role
router.use(authenticate);
router.use(requireHR);

// Get all employees (HR format)
router.get('/employees', hrController.getEmployees);

// Get all departments (HR format)
router.get('/departments', hrController.getDepartments);

module.exports = router;
