/**
 * Employee Code Generator
 * Generates unique employee codes
 */

const Employee = require('../models/Employee');

/**
 * Generate unique employee code
 * Format: EMP-XXXXX (5 random alphanumeric characters)
 * @returns {Promise<String>} Unique employee code
 */
async function generateEmployeeCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  while (!isUnique && attempts < maxAttempts) {
    // Generate 5 random characters
    code = 'EMP-' + Array.from({ length: 5 }, () => 
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join('');

    // Check if code exists
    const existing = await Employee.findOne({ employeeCode: code });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique employee code');
  }

  return code;
}

module.exports = {
  generateEmployeeCode
};
