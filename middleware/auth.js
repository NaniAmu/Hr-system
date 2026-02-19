/**
 * Authentication Middleware
 * JWT token verification and user extraction
 * CRITICAL: Every authenticated user MUST have an employee record (except ADMIN and service tokens)
 */

const { verifyToken, extractToken } = require('../utils/jwt');
const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * Verify JWT token and attach user info to request
 * BLOCKS access if employee record is missing (except ADMIN and service tokens)
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    console.log('[HR Auth] authenticate() called for:', req.method, req.path);

    if (!token) {
      console.log('[HR Auth] No token provided');
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided',
        action: 'Please login'
      });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const userRole = decoded.role;
    const isServiceToken = decoded.service === true;

    console.log('[HR Auth] Token decoded:', {
      userId,
      role: userRole,
      service: decoded.service,
      isServiceToken
    });

    // SERVICE TOKENS: Skip employee lookup entirely
    // Service tokens (from Helpdesk/other microservices) have service: true flag
    if (isServiceToken) {
      console.log('[HR Auth] Service token detected - bypassing employee lookup');
      req.user = {
        userId,
        email: decoded.email,
        role: userRole,
        employeeId: null,
        employee: null,
        isService: true
      };
      return next();
    }

    // Find employee record — only if userId is a valid ObjectId
    // Service tokens have non-ObjectId userIds, so they skip this
    let employee = null;
    const mongoose = require('mongoose');
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      employee = await Employee.findOne({ userId, status: 'ACTIVE' })
        .populate('departmentId', 'name code')
        .populate('userId', 'email role');
    }

    // Enforce employee record presence (requested)
    // Admin/HR may operate globally; service tokens bypass this; others must be linked.
    const mappedRole = userRole === 'SUPER_ADMIN' ? 'ADMIN' : userRole;
    if (!employee && mappedRole !== 'ADMIN' && mappedRole !== 'HR') {
      console.log('[HR Auth] Employee record missing for user:', userId);
      return res.status(403).json({
        code: 'EMPLOYEE_RECORD_MISSING',
        message: 'User account not linked to employee profile',
        action: 'Contact administrator'
      });
    }

    // Attach user info to request
    req.user = {
      userId,
      email: decoded.email,
      role: userRole,
      employeeId: employee?._id || decoded.employeeId || null,
      employee: employee ? employee.toObject() : null,
      isService: false
    };

    console.log('[HR Auth] Authentication successful for:', userId);
    next();
  } catch (error) {
    console.error('[HR Auth] Authentication error:', error.message);
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: error.message || 'Invalid or expired token',
      action: 'Please login again'
    });
  }
}

/**
 * Optional authentication - doesn't block if no token
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const userId = decoded.userId;

      if (userId) {
        const employee = await Employee.findOne({ userId })
          .populate('departmentId', 'name code')
          .populate('userId', 'email role');

        req.user = {
          userId,
          email: decoded.email,
          role: decoded.role,
          employeeId: employee?._id || decoded.employeeId || null,
          employee: employee ? employee.toObject() : null
        };
      }
    }

    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
}

module.exports = {
  authenticate,
  optionalAuth
};
