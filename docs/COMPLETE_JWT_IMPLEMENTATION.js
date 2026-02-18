/**
 * Complete JWT Authentication Implementation
 * Ready-to-use Node.js / Express code
 * 
 * This file demonstrates the complete authentication system
 * with all components working together.
 */

// ============================================================================
// 1. JWT UTILITIES (/utils/jwt.js)
// ============================================================================

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload (userId, role, employeeId, departmentId, email)
 * @returns {String} JWT token
 */
function generateToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      employeeId: payload.employeeId,
      departmentId: payload.departmentId || null,
      email: payload.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    }
  );
}

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token string or null
 */
function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

// ============================================================================
// 2. AUTHENTICATION MIDDLEWARE (/middleware/auth.js)
// ============================================================================

const Employee = require('../models/Employee');
const User = require('../models/User');

/**
 * Verify JWT token and attach user info to request
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

    // Enforce employee record presence (except ADMIN/HR)
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

// ============================================================================
// 3. AUTHENTICATION CONTROLLER (/controllers/authController.js)
// ============================================================================

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { generateToken } = require('../utils/jwt');
const { generateEmployeeCode } = require('../utils/employeeCode');
const { validationResult } = require('express-validator');

class AuthController {
  /**
   * REGISTER - Creates User + Employee
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

      // Generate token with shared secret
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
   * LOGIN - Authenticates user and returns token
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

      // Generate token with shared secret
      const token = generateToken({
        userId: user._id.toString(),
        role: user.role,
        employeeId: employee?._id?.toString() || null,
        departmentId: departmentId ? departmentId.toString() : null,
        email: user.email
      });

      const userPayload = {
        id: user._id.toString(),
        employeeId: employee?._id?.toString() || null,
        role: user.role,
        departmentId: departmentId ? departmentId.toString() : null,
        email: user.email
      };

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userPayload
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

// ============================================================================
// 4. AUTHENTICATION ROUTES (/routes/auth.routes.js)
// ============================================================================

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = new AuthController();

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

// ============================================================================
// 5. ENVIRONMENT CONFIGURATION (.env)
// ============================================================================

/*
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hr-system
DB_NAME=hr-system

# Server Configuration
PORT=3002
NODE_ENV=development

# JWT Configuration
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Helpdesk Integration
HELPDESK_API_URL=http://localhost:3003
*/

// ============================================================================
// 6. USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Login and get token
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "employeeId": "507f1f77bcf86cd799439012",
    "role": "EMPLOYEE",
    "departmentId": "507f1f77bcf86cd799439013",
    "email": "user@example.com"
  }
}

// Example 2: Use token in protected route
GET /api/employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Example 3: Register new user
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "departmentId": "507f1f77bcf86cd799439013",
  "position": "Software Engineer",
  "phone": "+251-9-12-345-678",
  "role": "EMPLOYEE"
}

// Example 4: JavaScript fetch with token
const token = localStorage.getItem('authToken');

fetch('http://localhost:3002/api/employees', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Example 5: Axios with token
import axios from 'axios';

const token = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

api.get('/employees')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/

// ============================================================================
// 7. HELPDESK INTEGRATION
// ============================================================================

/*
// In Helpdesk system, verify HR tokens using shared secret:

const jwt = require('jsonwebtoken');

function verifyHRToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      valid: true,
      payload: decoded
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// Use in middleware
function verifyHRTokenMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const verification = verifyHRToken(token);

  if (!verification.valid) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.hrUser = verification.payload;
  next();
}

// Use in route
router.get('/tickets', verifyHRTokenMiddleware, (req, res) => {
  console.log('HR User:', req.hrUser);
  res.json({ tickets: [] });
});
*/

module.exports = {
  generateToken,
  verifyToken,
  extractToken,
  authenticate,
  optionalAuth,
  AuthController
};
