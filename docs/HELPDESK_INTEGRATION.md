# Helpdesk System Integration Guide

## Overview

This document describes how to integrate the Helpdesk Management System with the HR Management System API. The integration enables real-time employee data synchronization, task assignment, and dashboard analytics.

## 🔐 Authentication

The HR System uses JWT-based authentication. The Helpdesk system must include a valid JWT token in the `Authorization` header for all API requests.

```
Authorization: Bearer <JWT_TOKEN>
```

### Getting a JWT Token

1. **Login via HR System:**
   ```
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Response:**
   ```json
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": { ... },
       "employee": { ... }
     }
   }
   ```

3. **Store token** and include in all subsequent requests.

## 📡 API Endpoints

### 1. Get Employees by Department

**Endpoint:** `GET /api/employees?departmentId=<id>`

**Description:** Returns all active employees in a specific department.

**Query Parameters:**
- `departmentId` (required): MongoDB ObjectId of the department

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "id": "507f191e810c19729de860ea",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "departmentId": "507f1f77bcf86cd799439012",
      "departmentName": "Engineering",
      "role": "EMPLOYEE",
      "status": "active",
      "position": "Software Engineer",
      "employeeCode": "EMP-12345"
    }
  ],
  "count": 1
}
```

**Error Responses:**
- `404`: Department not found
- `500`: Internal server error

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/employees?departmentId=507f1f77bcf86cd799439012" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Single Employee

**Endpoint:** `GET /api/employees/:id`

**Description:** Returns detailed information about a specific employee.

**Path Parameters:**
- `id` (required): MongoDB ObjectId of the employee

**Response Format:**
```json
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "departmentId": "507f1f77bcf86cd799439012",
    "departmentName": "Engineering",
    "role": "EMPLOYEE",
    "status": "active",
    "position": "Software Engineer",
    "employeeCode": "EMP-12345",
    "hiredAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `404`: Employee not found
- `500`: Internal server error

**Example Request:**
```bash
curl -X GET "http://localhost:3001/api/employees/507f191e810c19729de860ea" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Create Employee (Optional)

**Endpoint:** `POST /api/employees`

**Description:** Creates a new employee record. Requires HR or ADMIN role.

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "fullName": "Jane Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567891",
  "departmentId": "507f1f77bcf86cd799439012",
  "position": "Product Manager"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "id": "507f191e810c19729de860ea",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+1234567891",
    "departmentId": "507f1f77bcf86cd799439012",
    "departmentName": "Engineering",
    "role": "EMPLOYEE",
    "status": "active",
    "position": "Product Manager",
    "employeeCode": "EMP-67890"
  }
}
```

**Error Responses:**
- `400`: Validation error or employee already exists
- `403`: Insufficient permissions (not HR or ADMIN)
- `500`: Internal server error

## 🔑 Role-Based Access Control (RBAC)

### Permissions

| Role | Get Employees | Get Employee | Create Employee |
|------|-------------|--------------|-----------------|
| ADMIN | ✅ All | ✅ All | ✅ Yes |
| HR | ✅ All | ✅ All | ✅ Yes |
| DEPARTMENT_HEAD | ✅ Own Department | ✅ Own Department | ❌ No |
| EMPLOYEE | ❌ No | ✅ Self Only | ❌ No |

### Task Assignment Permissions

- **Manual Assignment:** Only `DEPARTMENT_HEAD` or `ADMIN` can assign tasks manually
- **Automatic Assignment:** System can assign tasks automatically based on workload

## 🔗 Helpdesk Integration Steps

### Step 1: Configure HR API Base URL

In your Helpdesk system configuration:

```javascript
const HR_API_BASE_URL = process.env.HR_API_BASE_URL || 'http://localhost:3001/api';
const HR_API_TOKEN = process.env.HR_API_TOKEN; // JWT token
```

### Step 2: Create HR API Service

```javascript
// services/hrApiService.js
const axios = require('axios');

class HRApiService {
  constructor(baseURL, token) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

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
}

module.exports = HRApiService;
```

### Step 3: Update Department Head Page

Replace static employee data with HR API calls:

```javascript
// In your Department Head component/page
const [employees, setEmployees] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const hrApi = new HRApiService(HR_API_BASE_URL, HR_API_TOKEN);
      const deptEmployees = await hrApi.getEmployeesByDepartment(departmentId);
      setEmployees(deptEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Handle error (show message, retry, etc.)
    } finally {
      setLoading(false);
    }
  };

  fetchEmployees();
}, [departmentId]);
```

### Step 4: Implement Manual Task Assignment

```javascript
// Task assignment component
const [employees, setEmployees] = useState([]);
const [selectedEmployee, setSelectedEmployee] = useState('');

// Fetch employees for dropdown
useEffect(() => {
  const fetchEmployees = async () => {
    if (userRole === 'DEPARTMENT_HEAD' || userRole === 'ADMIN') {
      const hrApi = new HRApiService(HR_API_BASE_URL, HR_API_TOKEN);
      const deptEmployees = await hrApi.getEmployeesByDepartment(userDepartmentId);
      setEmployees(deptEmployees);
    }
  };
  fetchEmployees();
}, []);

// Assign task
const handleAssignTask = async (taskId) => {
  if (!selectedEmployee) {
    alert('Please select an employee');
    return;
  }

  try {
    await assignTaskToEmployee(taskId, selectedEmployee);
    // Show success message
  } catch (error) {
    // Handle error
  }
};
```

### Step 5: Update Dashboard

```javascript
// Dashboard component
const [departmentStats, setDepartmentStats] = useState({});

useEffect(() => {
  const fetchDepartmentStats = async () => {
    const stats = {};
    
    for (const dept of departments) {
      try {
        const hrApi = new HRApiService(HR_API_BASE_URL, HR_API_TOKEN);
        const employees = await hrApi.getEmployeesByDepartment(dept.id);
        stats[dept.id] = {
          name: dept.name,
          employeeCount: employees.length,
          employees: employees
        };
      } catch (error) {
        console.error(`Error fetching employees for ${dept.name}:`, error);
      }
    }
    
    setDepartmentStats(stats);
  };

  fetchDepartmentStats();
}, [departments]);
```

## 🧪 Testing

### Postman Collection

Import the Postman collection from `docs/postman-collection.json` to test all endpoints.

### Test Scenarios

1. **Get Employees by Department**
   - Test with valid department ID
   - Test with invalid department ID (should return 404)
   - Test without authentication (should return 401)

2. **Get Single Employee**
   - Test with valid employee ID
   - Test with invalid employee ID (should return 404)
   - Test access control (EMPLOYEE can only see self)

3. **Create Employee**
   - Test with HR role (should succeed)
   - Test with EMPLOYEE role (should return 403)
   - Test with duplicate email (should return 400)

## 📊 Response Schema

### Employee Object

```typescript
interface Employee {
  userId: string;           // User ID (MongoDB ObjectId)
  id: string;              // Employee ID (MongoDB ObjectId)
  name: string;            // Full name
  email: string;           // Email address
  phone: string | null;    // Phone number (optional)
  departmentId: string;   // Department ID (MongoDB ObjectId)
  departmentName: string; // Department name
  role: string;           // User role (ADMIN, HR, DEPARTMENT_HEAD, EMPLOYEE)
  status: string;         // "active" or "inactive"
  position: string;       // Job position/title
  employeeCode: string;   // Unique employee code
  hiredAt?: string;       // Hire date (ISO 8601)
}
```

## ⚠️ Error Handling

All errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "action": "Suggested action for user"
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid JWT token
- `FORBIDDEN`: Insufficient permissions
- `EMPLOYEE_NOT_FOUND`: Employee does not exist
- `DEPARTMENT_NOT_FOUND`: Department does not exist
- `INTERNAL_ERROR`: Server error

## 🔄 Data Synchronization

### Real-time Updates

The HR system is the **single source of truth** for employee data. The Helpdesk system should:

1. **Cache employee data** for performance (with TTL)
2. **Refresh on demand** when viewing employee details
3. **Handle stale data** gracefully (show loading state, retry on error)

### Recommended Cache Strategy

```javascript
// Simple in-memory cache with TTL
const employeeCache = new Map();

async function getCachedEmployee(employeeId, ttl = 300000) { // 5 minutes
  const cached = employeeCache.get(employeeId);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const employee = await hrApi.getEmployeeById(employeeId);
  employeeCache.set(employeeId, {
    data: employee,
    timestamp: Date.now()
  });

  return employee;
}
```

## 🚀 Production Considerations

1. **API Rate Limiting:** Implement rate limiting on HR API
2. **Caching:** Use Redis or similar for distributed caching
3. **Error Retry:** Implement exponential backoff for failed requests
4. **Monitoring:** Log all API calls and errors
5. **Security:** Use HTTPS in production, rotate JWT tokens regularly

## 📝 Example Integration Code

See `examples/helpdesk-integration.js` for a complete example implementation.

## 🆘 Troubleshooting

### "Employee not found" errors
- Verify employee ID format (MongoDB ObjectId)
- Check if employee status is "ACTIVE"
- Ensure employee has valid department assignment

### "Department not linked" errors
- Verify department ID exists in HR system
- Check if employee has `departmentId` assigned
- Ensure department is active

### Authentication errors
- Verify JWT token is valid and not expired
- Check token includes required claims (userId, role, employeeId)
- Ensure token is included in Authorization header

## 📞 Support

For integration support, contact the HR System administrator or refer to the main documentation.
