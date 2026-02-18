/**
 * Example Helpdesk Integration Code
 * This file demonstrates how to integrate the Helpdesk system with HR API
 */

const axios = require('axios');

// Configuration
const HR_API_BASE_URL = process.env.HR_API_BASE_URL || 'http://localhost:3001/api';
let HR_API_TOKEN = process.env.HR_API_TOKEN || '';

/**
 * HR API Service Class
 * Handles all communication with HR System
 */
class HRApiService {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error status
          const { status, data } = error.response;
          if (status === 401) {
            console.error('Authentication failed. Please login again.');
          } else if (status === 404) {
            console.error('Resource not found:', data.message);
          } else if (status === 403) {
            console.error('Access forbidden:', data.message);
          } else {
            console.error('API Error:', data.message || error.message);
          }
        } else if (error.request) {
          // Request made but no response
          console.error('No response from HR API. Check network connection.');
        } else {
          // Error in request setup
          console.error('Request error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Update JWT token
   */
  setToken(token) {
    this.client.defaults.headers['Authorization'] = `Bearer ${token}`;
    HR_API_TOKEN = token;
  }

  /**
   * Get employees by department
   * @param {string} departmentId - MongoDB ObjectId
   * @returns {Promise<Array>} Array of employee objects
   */
  async getEmployeesByDepartment(departmentId) {
    try {
      const response = await this.client.get(`/employees?departmentId=${departmentId}`);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Department not found');
      }
      throw error;
    }
  }

  /**
   * Get single employee by ID
   * @param {string} employeeId - MongoDB ObjectId
   * @returns {Promise<Object>} Employee object
   */
  async getEmployeeById(employeeId) {
    try {
      const response = await this.client.get(`/employees/${employeeId}`);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Employee not found');
      }
      throw error;
    }
  }

  /**
   * Create new employee (optional, requires HR role)
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee object
   */
  async createEmployee(employeeData) {
    try {
      const response = await this.client.post('/employees', employeeData);
      return response.data.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Validation error');
      }
      throw error;
    }
  }
}

/**
 * Employee Cache with TTL
 * Caches employee data to reduce API calls
 */
class EmployeeCache {
  constructor(ttl = 300400) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }

  // Clear cache for specific department
  clearDepartment(departmentId) {
    for (const [key, value] of this.cache.entries()) {
      if (key.startsWith(`dept:${departmentId}`)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Helpdesk Integration Service
 * Main service for Helpdesk to interact with HR system
 */
class HelpdeskHRIntegration {
  constructor(hrApiBaseURL, hrApiToken) {
    this.hrApi = new HRApiService(hrApiBaseURL, hrApiToken);
    this.cache = new EmployeeCache();
  }

  /**
   * Get employees for department (with caching)
   * @param {string} departmentId - Department ID
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Array>} Array of employees
   */
  async getDepartmentEmployees(departmentId, useCache = true) {
    const cacheKey = `dept:${departmentId}`;

    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const employees = await this.hrApi.getEmployeesByDepartment(departmentId);
      this.cache.set(cacheKey, employees);
      return employees;
    } catch (error) {
      console.error(`Error fetching employees for department ${departmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get employee details (with caching)
   * @param {string} employeeId - Employee ID
   * @param {boolean} useCache - Whether to use cache
   * @returns {Promise<Object>} Employee object
   */
  async getEmployeeDetails(employeeId, useCache = true) {
    if (useCache) {
      const cached = this.cache.get(`emp:${employeeId}`);
      if (cached) {
        return cached;
      }
    }

    try {
      const employee = await this.hrApi.getEmployeeById(employeeId);
      this.cache.set(`emp:${employeeId}`, employee);
      return employee;
    } catch (error) {
      console.error(`Error fetching employee ${employeeId}:`, error);
      throw error;
    }
  }

  /**
   * Get employee count for department
   * @param {string} departmentId - Department ID
   * @returns {Promise<number>} Employee count
   */
  async getDepartmentEmployeeCount(departmentId) {
    try {
      const employees = await this.getDepartmentEmployees(departmentId);
      return employees.length;
    } catch (error) {
      console.error(`Error getting employee count for department ${departmentId}:`, error);
      return 0;
    }
  }

  /**
   * Check if user can assign tasks
   * @param {string} userRole - User role
   * @returns {boolean} True if user can assign tasks
   */
  canAssignTasks(userRole) {
    return userRole === 'DEPARTMENT_HEAD' || userRole === 'ADMIN' || userRole === 'HR';
  }

  /**
   * Refresh cache for department
   * @param {string} departmentId - Department ID
   */
  async refreshDepartmentCache(departmentId) {
    this.cache.clearDepartment(departmentId);
    return await this.getDepartmentEmployees(departmentId, false);
  }
}

// Example usage
async function exampleUsage() {
  // Initialize integration
  const integration = new HelpdeskHRIntegration(HR_API_BASE_URL, HR_API_TOKEN);

  try {
    // Example 1: Get employees for a department
    const departmentId = '507f1f77bcf86cd799439012';
    const employees = await integration.getDepartmentEmployees(departmentId);
    console.log(`Found ${employees.length} employees in department`);

    // Example 2: Get employee details
    if (employees.length > 0) {
      const employeeId = employees[0].id;
      const employee = await integration.getEmployeeDetails(employeeId);
      console.log('Employee details:', employee);
    }

    // Example 3: Get employee count for dashboard
    const count = await integration.getDepartmentEmployeeCount(departmentId);
    console.log(`Department has ${count} employees`);

    // Example 4: Check if user can assign tasks
    const userRole = 'DEPARTMENT_HEAD';
    if (integration.canAssignTasks(userRole)) {
      console.log('User can assign tasks');
    }

  } catch (error) {
    console.error('Integration error:', error);
  }
}

// Export for use in Helpdesk system
module.exports = {
  HRApiService,
  EmployeeCache,
  HelpdeskHRIntegration
};

// Run example if executed directly
if (require.main === module) {
  exampleUsage();
}
