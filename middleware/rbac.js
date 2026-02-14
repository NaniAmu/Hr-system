/**
 * Role-Based Access Control Middleware
 * RBAC rules for different user roles
 */

/**
 * Check if user has required role
 */
function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        action: 'Please login'
      });
    }

    const userRole = req.user.role;
    
    // Map roles
    let mappedRole = userRole;
    if (userRole === 'SUPER_ADMIN') mappedRole = 'ADMIN';

    if (!allowedRoles.includes(mappedRole)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        action: 'Contact administrator'
      });
    }

    next();
  };
}

/**
 * ADMIN only
 */
const requireAdmin = requireRole('ADMIN');

/**
 * HR or ADMIN
 */
const requireHR = requireRole('ADMIN', 'HR');

/**
 * DEPARTMENT_HEAD or above
 */
const requireDepartmentHead = requireRole('ADMIN', 'HR', 'DEPARTMENT_HEAD');

/**
 * Check if user can access department
 * DEPARTMENT_HEAD can only access their own department
 */
async function canAccessDepartment(req, res, next) {
  const { id } = req.params;
  const userRole = req.user.role;
  const mappedRole = userRole === 'SUPER_ADMIN' ? 'ADMIN' : userRole;

  // ADMIN and HR can access all departments
  if (mappedRole === 'ADMIN' || mappedRole === 'HR') {
    return next();
  }

  // DEPARTMENT_HEAD can only access their own department
  if (mappedRole === 'DEPARTMENT_HEAD' && req.user.employee) {
    const departmentId = req.user.employee.departmentId?._id || req.user.employee.departmentId;
    
    if (departmentId && departmentId.toString() === id) {
      return next();
    }
  }

  return res.status(403).json({
    code: 'FORBIDDEN',
    message: 'You can only access your own department',
    action: 'Contact administrator'
  });
}

/**
 * Check if user can access employee
 * - ADMIN/HR: all employees
 * - DEPARTMENT_HEAD: employees in their department
 * - EMPLOYEE: own profile only
 */
async function canAccessEmployee(req, res, next) {
  const { id } = req.params;
  const userRole = req.user.role;
  const mappedRole = userRole === 'SUPER_ADMIN' ? 'ADMIN' : userRole;

  // ADMIN and HR can access all employees
  if (mappedRole === 'ADMIN' || mappedRole === 'HR') {
    return next();
  }

  // DEPARTMENT_HEAD can only access employees in their department
  if (mappedRole === 'DEPARTMENT_HEAD' && req.user.employee) {
    const employeeDepartmentId = req.user.employee.departmentId?._id || req.user.employee.departmentId;
    
    // For viewing employees in department, allow if accessing by department ID
    if (req.params.departmentId && employeeDepartmentId && 
        employeeDepartmentId.toString() === req.params.departmentId) {
      return next();
    }
    
    // For individual employee access, check if employee is in same department
    const Employee = require('../models/Employee');
    const targetEmployee = await Employee.findById(id);
    
    if (targetEmployee && targetEmployee.departmentId) {
      const targetDeptId = targetEmployee.departmentId.toString();
      const userDeptId = employeeDepartmentId?.toString();
      
      if (targetDeptId === userDeptId) {
        return next();
      }
    }
  }

  // EMPLOYEE can only access their own record
  if (mappedRole === 'EMPLOYEE' && req.user.employeeId && req.user.employeeId.toString() === id) {
    return next();
  }

  return res.status(403).json({
    code: 'FORBIDDEN',
    message: 'You do not have permission to access this employee',
    action: 'Contact administrator'
  });
}

module.exports = {
  requireRole,
  requireAdmin,
  requireHR,
  requireDepartmentHead,
  canAccessDepartment,
  canAccessEmployee
};
