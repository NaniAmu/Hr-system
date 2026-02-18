# JWT Authentication Setup Guide

## Quick Start

### 1. Install Dependencies

All required dependencies are already in `package.json`:

```bash
npm install
```

Key packages:
- `jsonwebtoken` - JWT signing and verification
- `dotenv` - Environment variable management
- `bcryptjs` - Password hashing

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and set your JWT_SECRET:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hr-system
DB_NAME=hr-system

# Server Configuration
PORT=3002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=1d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Helpdesk Integration
HELPDESK_API_URL=http://localhost:3003
```

### 3. Generate a Strong JWT Secret

For production, generate a cryptographically secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and set it as `JWT_SECRET` in your `.env` file.

### 4. Start the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3002`

## Authentication Flow

### 1. User Registration

```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe",
    "departmentId": "507f1f77bcf86cd799439011",
    "position": "Software Engineer",
    "phone": "+251-9-12-345-678",
    "role": "EMPLOYEE"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "employeeId": "507f1f77bcf86cd799439012",
    "role": "EMPLOYEE",
    "departmentId": "507f1f77bcf86cd799439013",
    "email": "john@example.com"
  }
}
```

### 2. User Login

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "employeeId": "507f1f77bcf86cd799439012",
    "role": "EMPLOYEE",
    "departmentId": "507f1f77bcf86cd799439013",
    "email": "john@example.com"
  }
}
```

### 3. Use Token in Requests

Store the token and include it in subsequent requests:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

## Token Structure

### JWT Payload

```javascript
{
  userId: "507f1f77bcf86cd799439011",      // User's MongoDB ID
  role: "EMPLOYEE",                         // User's role
  employeeId: "507f1f77bcf86cd799439012",  // Employee record ID
  departmentId: "507f1f77bcf86cd799439013",// Department ID
  email: "john@example.com",                // User's email
  iat: 1704067200,                          // Issued at timestamp
  exp: 1704153600                           // Expiration timestamp (1 day later)
}
```

### Decode Token (for debugging)

Use [jwt.io](https://jwt.io) to decode and inspect tokens:

1. Go to https://jwt.io
2. Paste your token in the "Encoded" section
3. Set the secret in the "Verify Signature" section
4. View the decoded payload

## Helpdesk Integration

### Share JWT Secret

To enable Helpdesk to verify HR tokens:

1. **HR System `.env`**:
   ```env
   JWT_SECRET=your-shared-secret-key
   ```

2. **Helpdesk System `.env`**:
   ```env
   JWT_SECRET=your-shared-secret-key
   ```

Both systems must use the **exact same** `JWT_SECRET`.

### Verify HR Tokens in Helpdesk

Use the provided verification module:

```javascript
const { verifyHRToken, verifyHRTokenMiddleware } = require('./shared-auth/helpdesk-token-verification');

// Option 1: Manual verification
const token = req.headers.authorization?.split(' ')[1];
const verification = verifyHRToken(token);

if (verification.valid) {
  console.log('User:', verification.payload.userId);
  console.log('Role:', verification.payload.role);
} else {
  console.log('Invalid token:', verification.error);
}

// Option 2: Use middleware
router.get('/tickets', verifyHRTokenMiddleware, (req, res) => {
  console.log('HR User:', req.hrUser);
  res.json({ tickets: [] });
});
```

## Code Structure

### JWT Utilities (`/utils/jwt.js`)

```javascript
const { generateToken, verifyToken, extractToken } = require('./utils/jwt');

// Generate token
const token = generateToken({
  userId: '507f1f77bcf86cd799439011',
  role: 'EMPLOYEE',
  employeeId: '507f1f77bcf86cd799439012',
  departmentId: '507f1f77bcf86cd799439013',
  email: 'user@example.com'
});

// Verify token
try {
  const decoded = verifyToken(token);
  console.log('Valid token:', decoded);
} catch (error) {
  console.log('Invalid token:', error.message);
}

// Extract from header
const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const extractedToken = extractToken(authHeader);
```

### Authentication Middleware (`/middleware/auth.js`)

```javascript
const { authenticate, optionalAuth } = require('./middleware/auth');

// Protected route
router.get('/employees', authenticate, (req, res) => {
  console.log('User:', req.user);
  // req.user contains: userId, email, role, employeeId, employee
});

// Optional auth route
router.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

### Authentication Controller (`/controllers/authController.js`)

```javascript
const authController = require('./controllers/authController');

// Login
POST /api/auth/login
// Returns: { token, user, ... }

// Register
POST /api/auth/register
// Returns: { token, user, ... }
```

## Security Checklist

- [ ] JWT_SECRET is set in `.env` (minimum 32 characters)
- [ ] JWT_SECRET is NOT committed to version control
- [ ] JWT_SECRET is different for each environment (dev, staging, prod)
- [ ] HTTPS is enabled in production
- [ ] Token expiration is set to 1 day
- [ ] Tokens are validated on every protected request
- [ ] User status is checked (isActive flag)
- [ ] Employee record is verified (except for ADMIN/HR roles)
- [ ] Passwords are hashed with bcryptjs
- [ ] CORS is properly configured

## Troubleshooting

### "JWT_SECRET is not defined"

**Solution**: Add `JWT_SECRET` to your `.env` file

```env
JWT_SECRET=your-super-secret-key-min-32-chars
```

### "Invalid or expired token"

**Causes**:
- Token has expired (default 1 day)
- Token was signed with different secret
- Token is malformed

**Solution**:
- Login again to get a new token
- Verify `JWT_SECRET` matches between systems
- Check token format in Authorization header

### "No authentication token provided"

**Solution**: Include Authorization header in request

```bash
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### "Employee record missing"

**Causes**:
- User exists but has no associated employee record
- Employee record is inactive

**Solution**:
- Create employee record for user
- Activate employee record
- Contact administrator

## Testing

### Test with Postman

1. **Login Request**:
   - Method: POST
   - URL: `http://localhost:3002/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@example.com",
       "password": "admin123"
     }
     ```

2. **Copy Token**:
   - Copy the `token` value from response

3. **Use Token**:
   - Create new request
   - Method: GET
   - URL: `http://localhost:3002/api/employees`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer YOUR_TOKEN_HERE`

### Test with cURL

```bash
# Login
RESPONSE=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

# Extract token
TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Use token
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### Test with JavaScript

```javascript
// Login
const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Use token
const dataResponse = await fetch('http://localhost:3002/api/employees', {
  method: 'GET',
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await dataResponse.json();
console.log(data);
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | - | Secret key for signing tokens (REQUIRED) |
| `JWT_EXPIRES_IN` | `1d` | Token expiration time |
| `MONGODB_URI` | `mongodb://localhost:27017/hr-system` | MongoDB connection string |
| `PORT` | `3002` | Server port |
| `NODE_ENV` | `development` | Environment (development/production) |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS allowed origin |

## Next Steps

1. ✅ Configure `.env` with JWT_SECRET
2. ✅ Start the server (`npm run dev`)
3. ✅ Test login endpoint
4. ✅ Test protected endpoints with token
5. ✅ Integrate with Helpdesk system (share JWT_SECRET)
6. ✅ Deploy to production with strong secret

## References

- [JWT.io](https://jwt.io) - JWT documentation
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Node.js JWT library
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
