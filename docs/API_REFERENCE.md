# HR System API Reference

## Base URL

```
http://localhost:3001/api
```

## Authentication

All endpoints (except public endpoints) require JWT authentication:

```
Authorization: Bearer <JWT_TOKEN>
```

## Endpoints

### Employees

#### GET /employees

Get all employees or filter by department.

**Query Parameters:**
- `departmentId` (optional): Filter employees by department ID

**Request:**
```bash
GET /api/employees?departmentId=507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**Response (200 OK):**
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
- `401 Unauthorized`: Missing or invalid token
- `404 Not Found`: Department not found (if departmentId provided)
- `500 Internal Server Error`: Server error

---

#### GET /employees/:id

Get single employee by ID.

**Path Parameters:**
- `id` (required): Employee MongoDB ObjectId

**Request:**
```bash
GET /api/employees/507f191e810c19729de860ea
Authorization: Bearer <token>
```

**Response (200 OK):**
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
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Employee not found
- `500 Internal Server Error`: Server error

---

#### POST /employees

Create a new employee. Requires HR or ADMIN role.

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

**Response (201 Created):**
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
- `400 Bad Request`: Validation error or employee already exists
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions (not HR or ADMIN)
- `500 Internal Server Error`: Server error

---

## Data Schema

### Employee Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User ID (MongoDB ObjectId) |
| id | string | Yes | Employee ID (MongoDB ObjectId) |
| name | string | Yes | Full name |
| email | string | Yes | Email address |
| phone | string \| null | No | Phone number |
| departmentId | string | Yes | Department ID (MongoDB ObjectId) |
| departmentName | string | No | Department name |
| role | string | Yes | User role (ADMIN, HR, DEPARTMENT_HEAD, EMPLOYEE) |
| status | string | Yes | "active" or "inactive" |
| position | string | Yes | Job position/title |
| employeeCode | string | Yes | Unique employee code |
| hiredAt | string | No | Hire date (ISO 8601) |

## Role-Based Access Control

| Endpoint | ADMIN | HR | DEPARTMENT_HEAD | EMPLOYEE |
|----------|-------|----|------------------|----------|
| GET /employees | ✅ All | ✅ All | ✅ Own Dept | ❌ |
| GET /employees/:id | ✅ All | ✅ All | ✅ Own Dept | ✅ Self Only |
| POST /employees | ✅ | ✅ | ❌ | ❌ |

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication token |
| FORBIDDEN | 403 | Insufficient permissions |
| EMPLOYEE_NOT_FOUND | 404 | Employee does not exist |
| DEPARTMENT_NOT_FOUND | 404 | Department does not exist |
| EMAIL_EXISTS | 400 | Email already in use |
| EMPLOYEE_EXISTS | 400 | Employee already exists for user |
| INTERNAL_ERROR | 500 | Server error |

## Rate Limiting

Production deployments should implement rate limiting:
- Recommended: 100 requests per minute per IP
- Burst: 20 requests per second

## Best Practices

1. **Caching**: Cache employee data for 5 minutes to reduce API calls
2. **Error Handling**: Always handle 404 and 500 errors gracefully
3. **Retry Logic**: Implement exponential backoff for failed requests
4. **Token Refresh**: Refresh JWT tokens before expiration
5. **Validation**: Validate employee IDs before making API calls
