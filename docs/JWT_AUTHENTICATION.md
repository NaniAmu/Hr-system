# JWT Authentication System - Implementation Guide

## Overview

This HR Management System uses JWT (JSON Web Tokens) for authentication with a shared secret that can be used by the Helpdesk system for token verification.

## Configuration

### 1. Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1d
```

### 2. Generate a Strong Secret

For production, generate a cryptographically secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Example output:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Use this value for `JWT_SECRET` in your `.env` file.

## Token Structure

### Token Payload

Each JWT token includes the following claims:

```javascript
{
  userId: "user-mongodb-id",           // User's MongoDB ID
  role: "ADMIN|HR|EMPLOYEE|...",       // User's role
  employeeId: "employee-mongodb-id",   // Employee record ID (if exists)
  departmentId: "department-id",       // Department ID (if applicable)
  email: "user@example.com",           // User's email
  iat: 1234567890,                     // Issued at (auto-generated)
  exp: 1234654290                      // Expiration (1 day from issue)
}
```

### Token Expiration

- **Default**: 1 day (86400 seconds)
- **Configurable via**: `JWT_EXPIRES_IN` environment variable
- **Format**: Can use time strings like `"1d"`, `"24h"`, `"86400s"`, etc.

## API Endpoints

### Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "employeeId": "employee-id",
    "role": "EMPLOYEE",
    "departmentId": "dept-id",
    "email": "user@example.com"
  }
}
```

### Register

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "departmentId": "dept-id",
  "position": "Software Engineer",
  "phone": "+251-9-12-345-678",
  "role": "EMPLOYEE"
}
```

**Response** (Success - 201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "employeeId": "employee-id",
    "role": "EMPLOYEE",
    "departmentId": "dept-id",
    "email": "newuser@example.com"
  }
}
```

## Using Tokens

### Authorization Header

Include the token in the `Authorization` header with the `Bearer` scheme:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example Request

```bash
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript/Fetch Example

```javascript
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
```

### Axios Example

```javascript
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
```

## Helpdesk Integration

### Shared Secret Configuration

To enable the Helpdesk system to verify tokens issued by the HR system:

1. **Share the same `JWT_SECRET`** between both systems
2. **Use the same token format** (both systems must use the same JWT library and signing algorithm)
3. **Verify tokens** using the shared secret

### Helpdesk Token Verification Example

```javascript
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

// Usage
const token = req.headers.authorization?.split(' ')[1];
const verification = verifyHRToken(token);

if (verification.valid) {
  console.log('Token is valid');
  console.log('User ID:', verification.payload.userId);
  console.log('Role:', verification.payload.role);
} else {
  console.log('Token is invalid:', verification.error);
}
```

## JWT Utilities

### Location

`/utils/jwt.js`

### Functions

#### `generateToken(payload)`

Generates a new JWT token.

**Parameters**:
- `payload` (Object): Token payload
  - `userId` (String): User's MongoDB ID
  - `role` (String): User's role
  - `employeeId` (String, optional): Employee record ID
  - `departmentId` (String, optional): Department ID
  - `email` (String): User's email

**Returns**: JWT token string

**Example**:
```javascript
const { generateToken } = require('./utils/jwt');

const token = generateToken({
  userId: '507f1f77bcf86cd799439011',
  role: 'EMPLOYEE',
  employeeId: '507f1f77bcf86cd799439012',
  departmentId: '507f1f77bcf86cd799439013',
  email: 'user@example.com'
});
```

#### `verifyToken(token)`

Verifies and decodes a JWT token.

**Parameters**:
- `token` (String): JWT token to verify

**Returns**: Decoded token payload (Object)

**Throws**: Error if token is invalid or expired

**Example**:
```javascript
const { verifyToken } = require('./utils/jwt');

try {
  const decoded = verifyToken(token);
  console.log('User ID:', decoded.userId);
  console.log('Role:', decoded.role);
} catch (error) {
  console.error('Invalid token:', error.message);
}
```

#### `extractToken(authHeader)`

Extracts token from Authorization header.

**Parameters**:
- `authHeader` (String): Authorization header value

**Returns**: Token string or null

**Example**:
```javascript
const { extractToken } = require('./utils/jwt');

const token = extractToken('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
// Returns: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## Authentication Middleware

### Location

`/middleware/auth.js`

### Middleware Functions

#### `authenticate(req, res, next)`

Verifies JWT token and attaches user info to request.

**Usage**:
```javascript
const { authenticate } = require('./middleware/auth');

router.get('/protected-route', authenticate, (req, res) => {
  console.log('User:', req.user);
  // req.user contains: userId, email, role, employeeId, employee
});
```

#### `optionalAuth(req, res, next)`

Optional authentication - doesn't block if no token.

**Usage**:
```javascript
const { optionalAuth } = require('./middleware/auth');

router.get('/public-route', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

## Error Handling

### Common Error Responses

#### Invalid Credentials (401)
```json
{
  "code": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

#### No Token Provided (401)
```json
{
  "code": "UNAUTHORIZED",
  "message": "No authentication token provided",
  "action": "Please login"
}
```

#### Invalid or Expired Token (401)
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "action": "Please login again"
}
```

#### Account Inactive (403)
```json
{
  "code": "ACCOUNT_INACTIVE",
  "message": "Account is inactive"
}
```

#### Employee Record Missing (403)
```json
{
  "code": "EMPLOYEE_RECORD_MISSING",
  "message": "User account not linked to employee profile",
  "action": "Contact administrator"
}
```

## Security Best Practices

1. **Secret Management**
   - Never commit `.env` file to version control
   - Use strong, randomly generated secrets (minimum 32 characters)
   - Rotate secrets periodically in production
   - Use different secrets for different environments

2. **Token Storage**
   - Store tokens securely (HttpOnly cookies or secure storage)
   - Never store tokens in localStorage if sensitive data is involved
   - Clear tokens on logout

3. **HTTPS**
   - Always use HTTPS in production
   - Never transmit tokens over unencrypted connections

4. **Token Expiration**
   - Use short expiration times (1 day is reasonable)
   - Implement refresh token mechanism for long-lived sessions
   - Validate expiration on every request

5. **Validation**
   - Always validate token signature
   - Check token expiration
   - Verify user still exists and is active
   - Validate user permissions for requested resource

## Testing

### Manual Testing with cURL

```bash
# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Use token in subsequent requests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### Testing with Postman

1. Login to get token
2. Copy token from response
3. In subsequent requests, set Authorization header:
   - Type: Bearer Token
   - Token: (paste the token)

## Troubleshooting

### "Invalid or expired token"

**Causes**:
- Token has expired (default 1 day)
- Token was signed with different secret
- Token is malformed

**Solution**:
- Login again to get a new token
- Verify `JWT_SECRET` is the same in `.env`
- Check token format in Authorization header

### "No authentication token provided"

**Causes**:
- Authorization header is missing
- Authorization header format is incorrect

**Solution**:
- Include `Authorization: Bearer <token>` header
- Ensure header format is exactly `Bearer <token>` (with space)

### "Employee record missing"

**Causes**:
- User exists but has no associated employee record
- Employee record is inactive

**Solution**:
- Create employee record for user
- Activate employee record
- Contact administrator

## References

- [JWT.io](https://jwt.io) - JWT documentation and debugger
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Node.js JWT library
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification
