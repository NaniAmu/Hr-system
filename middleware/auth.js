/**
 * Authentication Middleware
 * JWT token verification and user extraction
 * CRITICAL: Every authenticated user MUST have an employee record (except ADMIN)
 */

const { verifyToken, extractToken } = require('../utils/jwt');
const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * Verify JWT token and attach user info to request
 * BLOCKS access if employee record is missing (except ADMIN)
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided',
        action: 'Please login'
      });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const userRole = decoded.role;

    // Find employee record
    let employee = null;
    if (userId) {
      employee = await Employee.findOne({ userId, status: 'ACTIVE' })
        .populate('departmentId', 'name code')
        .populate('userId', 'email role');
    }

    // Enforce employee record presence (requested)
    // Admin/HR may operate globally; others must be linked.
    const mappedRole = userRole === 'SUPER_ADMIN' ? 'ADMIN' : userRole;
    if (!employee && mappedRole !== 'ADMIN' && mappedRole !== 'HR') {
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
      employee: employee ? employee.toObject() : null
    };

    next();
  } catch (error) {
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
