/**
 * Helpdesk Integration - JWT Token Verification
 * 
 * This example shows how the Helpdesk system can verify tokens
 * issued by the HR Management System using the shared JWT_SECRET.
 * 
 * Setup:
 * 1. Ensure both systems have the same JWT_SECRET in their .env files
 * 2. Import this module in your Helpdesk authentication middleware
 * 3. Use verifyHRToken() to validate tokens from HR system
 */

const jwt = require('jsonwebtoken');

/**
 * Verify a token issued by the HR Management System
 * 
 * @param {String} token - JWT token to verify
 * @returns {Object} - { valid: boolean, payload: Object|null, error: String|null }
 */
function verifyHRToken(token) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return {
      valid: true,
      payload: decoded,
      error: null
    };
  } catch (error) {
    return {
      valid: false,
      payload: null,
      error: error.message
    };
  }
}

/**
 * Extract token from Authorization header
 * 
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} - Token string or null
 */
function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Middleware for Helpdesk to verify HR tokens
 * 
 * Usage:
 * const { verifyHRTokenMiddleware } = require('./hr-token-verification');
 * router.get('/helpdesk-route', verifyHRTokenMiddleware, (req, res) => {
 *   console.log('HR User:', req.hrUser);
 * });
 */
function verifyHRTokenMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No authentication token provided',
        action: 'Please provide a valid HR token'
      });
    }

    const verification = verifyHRToken(token);

    if (!verification.valid) {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        error: verification.error,
        action: 'Please login to HR system again'
      });
    }

    // Attach HR user info to request
    req.hrUser = {
      userId: verification.payload.userId,
      email: verification.payload.email,
      role: verification.payload.role,
      employeeId: verification.payload.employeeId,
      departmentId: verification.payload.departmentId,
      issuedAt: new Date(verification.payload.iat * 1000),
      expiresAt: new Date(verification.payload.exp * 1000)
    };

    next();
  } catch (error) {
    return res.status(500).json({
      code: 'INTERNAL_ERROR',
      message: 'Token verification failed',
      error: error.message
    });
  }
}

/**
 * Decode token without verification (for debugging only)
 * WARNING: Only use for debugging - always verify tokens in production
 * 
 * @param {String} token - JWT token to decode
 * @returns {Object|null} - Decoded payload or null
 */
function decodeTokenWithoutVerification(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiration time
 * 
 * @param {String} token - JWT token
 * @returns {Object} - { expiresAt: Date, expiresIn: Number (seconds), isExpired: Boolean }
 */
function getTokenExpiration(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return {
        expiresAt: null,
        expiresIn: null,
        isExpired: true
      };
    }

    const expiresAt = new Date(decoded.exp * 1000);
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    const isExpired = expiresIn <= 0;

    return {
      expiresAt,
      expiresIn,
      isExpired
    };
  } catch (error) {
    return {
      expiresAt: null,
      expiresIn: null,
      isExpired: true
    };
  }
}

/**
 * Example: Helpdesk Express Route using HR Token
 * 
 * Usage in your Helpdesk application:
 * 
 * const express = require('express');
 * const router = express.Router();
 * const { verifyHRTokenMiddleware } = require('./hr-token-verification');
 * 
 * // Protected route that accepts HR tokens
 * router.get('/tickets', verifyHRTokenMiddleware, (req, res) => {
 *   const hrUser = req.hrUser;
 *   
 *   // Use HR user info to filter tickets
 *   const tickets = getTicketsForUser(hrUser.userId);
 *   
 *   res.json({
 *     success: true,
 *     user: hrUser,
 *     tickets: tickets
 *   });
 * });
 * 
 * module.exports = router;
 */

/**
 * Example: Verify token from HR system in Helpdesk
 * 
 * const { verifyHRToken, extractToken } = require('./hr-token-verification');
 * 
 * // Get token from request
 * const token = extractToken(req.headers.authorization);
 * 
 * // Verify token
 * const verification = verifyHRToken(token);
 * 
 * if (verification.valid) {
 *   console.log('✅ Token is valid');
 *   console.log('User ID:', verification.payload.userId);
 *   console.log('Role:', verification.payload.role);
 *   console.log('Email:', verification.payload.email);
 * } else {
 *   console.log('❌ Token is invalid:', verification.error);
 * }
 */

module.exports = {
  verifyHRToken,
  extractToken,
  verifyHRTokenMiddleware,
  decodeTokenWithoutVerification,
  getTokenExpiration
};
