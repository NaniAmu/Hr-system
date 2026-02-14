/**
 * JWT Utilities
 * Shared with Helpdesk system
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {Object} payload - Token payload (userId, role, employeeId)
 * @returns {String} JWT token
 */
function generateToken(payload) {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
      employeeId: payload.employeeId,
      email: payload.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
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

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};
