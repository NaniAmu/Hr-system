/**
 * Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireHR } = require('../middleware/rbac');

// Global analytics should be HR/Admin only
router.get(
  '/employees',
  authenticate,
  requireHR,
  analyticsController.employees
);

router.get(
  '/department/:id',
  authenticate,
  requireHR,
  analyticsController.department
);

module.exports = router;

