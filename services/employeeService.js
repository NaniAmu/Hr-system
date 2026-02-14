/**
 * Employee Service
 * Handles automatic Employee record creation
 * Ensures every user has a corresponding Employee record
 */

const Employee = require('../models/Employee');
const { generateEmployeeCode } = require('../utils/employeeCode');

/**
 * Auto-create Employee record for a user
 * @param {Object} user - User document
 * @param {Object} options - Additional options
 * @param {String} options.departmentId - Department ID (optional)
 * @param {String} options.fullName - Full name (defaults to email)
 * @param {String} options.phone - Phone number (optional)
 * @param {String} options.position - Position (defaults based on role)
 * @returns {Object} Created Employee document
 */
async function autoCreateEmployee(user, options = {}) {
  try {
    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ userId: user._id });
    if (existingEmployee) {
      return existingEmployee;
    }

    // Department assignment may be null initially; HR/Admin can assign later.
    const departmentId = options.departmentId ?? null;

    // Generate unique employee code
    const employeeCode = await generateEmployeeCode();

    // Position may be null initially; can be updated later.
    const position = options.position ?? null;

    // Create employee record
    const employee = new Employee({
      userId: user._id,
      role: user.role,
      employeeCode,
      fullName: options.fullName || user.email.split('@')[0] || 'User',
      email: user.email,
      phone: options.phone || null,
      departmentId,
      position,
      status: 'ACTIVE',
      hiredAt: new Date()
    });

    await employee.save();
    if (employee.departmentId) {
      await employee.populate('departmentId', 'name code');
    }

    return employee;
  } catch (error) {
    console.error('Error auto-creating employee:', error);
    throw error;
  }
}

module.exports = {
  autoCreateEmployee
};
