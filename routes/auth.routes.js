/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['ADMIN', 'HR', 'HR_ADMIN', 'DEPARTMENT_HEAD', 'EMPLOYEE']).withMessage('Invalid role'),
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('departmentId').notEmpty().withMessage('Department ID is required'),
  body('position').notEmpty().withMessage('Position is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Register (creates User + Employee)
router.post('/register', registerValidation, authController.register);

// Login
router.post('/login', loginValidation, authController.login);

module.exports = router;
