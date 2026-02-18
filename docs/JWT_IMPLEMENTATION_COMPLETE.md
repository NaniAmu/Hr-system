# JWT Authentication System - Complete Implementation

## ✅ Implementation Status

The HR Management System has a **complete, production-ready JWT authentication system** with the following features:

### ✅ Completed Features

1. **JWT Token Generation** ✓
   - Uses `process.env.JWT_SECRET` for signing
   - Includes user ID and role in payload
   - Set to 1 day expiration
   - Includes employeeId, departmentId, and email

2. **Token Verification** ✓
   - Validates token signature using shared secret
   - Checks token expiration
   - Throws clear error messages

3. **Authentication Middleware** ✓
   - Protects routes with JWT verification
   - Extracts user info from token
   - Validates employee record (except ADMIN/HR)
   - Optional authentication support

4. **Login Route** ✓
   - Authenticates user credentials
   - Generates JWT token
   - Returns user info with token

5. **Registration Route** ✓
   - Creates user and employee records
   - Generates JWT token
   - Returns user info with token

6. **Helpdesk Integration Ready** ✓
   - Shared secret configuration
   - Token verification utilities
   - Example middleware for Helpdesk

---

## 📦 Files Overview

### Core Authentication Files

| File | Purpose |
|------|---------|
| `/utils/jwt.js` | JWT token generation and verification |
| `/middleware/auth.js` | Authentication middleware |
| `/controllers/authController.js` | Login and registration logic |
| `/routes/auth.routes.js` | Authentication endpoints |
| `/shared-auth/helpdesk-token-verification.js` | Helpdesk integration utilities |

### Documentation Files

| File | Purpose |
|------|---------|
| `/docs/JWT_AUTHENTICATION.md` | Complete JWT documentation |
| `/docs/JWT_SETUP_GUIDE.md` | Setup and configuration guide |
| `/docs/JWT_QUICK_REFERENCE.md` | Quick reference guide |
| `/docs/COMPLETE_JWT_IMPLEMENTATION.js` | Full code examples |
| `/.env.example` | Environment variable template |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

All required packages are already in `package.json`:
- `jsonwebtoken` - JWT signing/verification
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables
- `express-validator` - Input validation

### 2. Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update `.env`:
```env
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=1d
MONGODB_URI=mongodb://localhost:27017/hr-system
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3002`

---

## 🔐 Authentication Flow

### Login Flow
```
1. User sends email + password to POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token with:
   - userId
   - role
   - employeeId
   - departmentId
   - email
   - expiration (1 day)
4. Server returns token to client
5. Client stores token (localStorage/sessionStorage)
6. Client includes token in Authorization header for subsequent requests
```

### Protected Route Flow
```
1. Client sends request with Authorization: Bearer <token>
2. Middleware extracts token from header
3. Middleware verifies token signature using JWT_SECRET
4. Middleware checks token expiration
5. Middleware validates user exists and is active
6. Middleware validates employee record exists (except ADMIN/HR)
7. Middleware attaches user info to request
8. Route handler processes request with authenticated user
```

---

## 📋 API Endpoints

### POST /api/auth/login
Login and get JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
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
    "email": "user@example.com"
  }
}
```

### POST /api/auth/register
Register new user and get JWT token

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "departmentId": "507f1f77bcf86cd799439013",
  "position": "Software Engineer",
  "phone": "+251-9-12-345-678",
  "role": "EMPLOYEE"
}
```

**Response (201):**
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
    "email": "newuser@example.com"
  }
}
```

### Protected Routes
All routes using `authenticate` middleware require Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 Usage Examples

### cURL
```bash
# Login
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Use token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript/Fetch
```javascript
// Login
const loginRes = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await loginRes.json();
localStorage.setItem('authToken', token);

// Use token
const token = localStorage.getItem('authToken');
const dataRes = await fetch('http://localhost:3002/api/employees', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const data = await dataRes.json();
console.log(data);
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api'
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

const token = data.token;
localStorage.setItem('authToken', token);

// Use token
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

const employees = await api.get('/employees');
console.log(employees.data);
```

### Express Route
```javascript
const { authenticate } = require('./middleware/auth');

router.get('/employees', authenticate, (req, res) => {
  console.log('Authenticated user:', req.user);
  // req.user = {
  //   userId: "507f1f77bcf86cd799439011",
  //   email: "user@example.com",
  //   role: "EMPLOYEE",
  //   employeeId: "507f1f77bcf86cd799439012",
  //   employee: { ... }
  // }
  
  res.json({ employees: [] });
});
```

---

## 🔗 Helpdesk Integration

### Setup

1. **Share JWT_SECRET** between HR and Helpdesk systems
   
   **HR System (.env)**:
   ```env
   JWT_SECRET=your-shared-secret-key
   ```
   
   **Helpdesk System (.env)**:
   ```env
   JWT_SECRET=your-shared-secret-key
   ```

2. **Use verification utilities** in Helpdesk

   ```javascript
   const { verifyHRToken, verifyHRTokenMiddleware } = require('./shared-auth/helpdesk-token-verification');
   
   // Option 1: Manual verification
   const token = req.headers.authorization?.split(' ')[1];
   const verification = verifyHRToken(token);
   
   if (verification.valid) {
     console.log('User:', verification.payload.userId);
   }
   
   // Option 2: Use middleware
   router.get('/tickets', verifyHRTokenMiddleware, (req, res) => {
     console.log('HR User:', req.hrUser);
     res.json({ tickets: [] });
   });
   ```

### Token Payload Available to Helpdesk

```javascript
{
  userId: "507f1f77bcf86cd799439011",      // User ID
  role: "EMPLOYEE",                         // User role
  employeeId: "507f1f77bcf86cd799439012",  // Employee ID
  departmentId: "507f1f77bcf86cd799439013",// Department ID
  email: "user@example.com",                // Email
  iat: 1704067200,                          // Issued at
  exp: 1704153600                           // Expires (1 day)
}
```

---

## 🔒 Security Features

### ✅ Implemented Security

1. **Secret-based Signing**
   - Uses `process.env.JWT_SECRET` for signing
   - Shared secret for Helpdesk verification
   - Minimum 32 characters recommended

2. **Token Expiration**
   - Default 1 day expiration
   - Configurable via `JWT_EXPIRES_IN`
   - Validated on every request

3. **Password Security**
   - Passwords hashed with bcryptjs
   - Never stored in plain text
   - Compared securely on login

4. **User Validation**
   - Checks user exists and is active
   - Validates employee record (except ADMIN/HR)
   - Prevents inactive accounts from accessing

5. **Request Validation**
   - Email format validation
   - Password length validation
   - Required field validation

### 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to version control
   - Use strong, randomly generated secrets
   - Different secrets per environment

2. **HTTPS**
   - Always use HTTPS in production
   - Never transmit tokens over HTTP

3. **Token Storage**
   - Store in secure location (HttpOnly cookies preferred)
   - Clear on logout
   - Don't expose in logs

4. **Token Validation**
   - Always verify signature
   - Check expiration
   - Validate user status
   - Verify employee record

---

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Test Protected Route
```bash
TOKEN="your-token-here"
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### Test with Postman

1. **Login Request**
   - Method: POST
   - URL: `http://localhost:3002/api/auth/login`
   - Body: `{"email":"admin@example.com","password":"admin123"}`

2. **Copy Token**
   - Copy `token` from response

3. **Use Token**
   - Create new request
   - Method: GET
   - URL: `http://localhost:3002/api/employees`
   - Headers: `Authorization: Bearer YOUR_TOKEN`

---

## 🐛 Troubleshooting

### "JWT_SECRET is not defined"
**Solution**: Add `JWT_SECRET` to `.env` file

```env
JWT_SECRET=your-super-secret-key-min-32-chars
```

### "Invalid or expired token"
**Causes**:
- Token has expired (1 day)
- Token signed with different secret
- Token is malformed

**Solution**:
- Login again to get new token
- Verify `JWT_SECRET` matches
- Check Authorization header format

### "No authentication token provided"
**Solution**: Include Authorization header

```bash
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### "Employee record missing"
**Solution**: Create employee record for user or contact administrator

---

## �� Documentation

- **[JWT_AUTHENTICATION.md](./JWT_AUTHENTICATION.md)** - Complete JWT documentation
- **[JWT_SETUP_GUIDE.md](./JWT_SETUP_GUIDE.md)** - Setup and configuration
- **[JWT_QUICK_REFERENCE.md](./JWT_QUICK_REFERENCE.md)** - Quick reference
- **[COMPLETE_JWT_IMPLEMENTATION.js](./COMPLETE_JWT_IMPLEMENTATION.js)** - Full code examples

---

## 📞 Support

For issues:
1. Check `.env` configuration
2. Verify `JWT_SECRET` is set
3. Check Authorization header format
4. Review server logs
5. Use [jwt.io](https://jwt.io) to decode tokens

---

## 🎯 Next Steps

1. ✅ Configure `.env` with `JWT_SECRET`
2. ✅ Start server (`npm run dev`)
3. ✅ Test login endpoint
4. ✅ Test protected endpoints
5. ✅ Integrate with Helpdesk (share `JWT_SECRET`)
6. ✅ Deploy to production

---

## 📋 Checklist

- [ ] `.env` file created with `JWT_SECRET`
- [ ] Server started successfully
- [ ] Login endpoint working
- [ ] Protected routes accessible with token
- [ ] Token expiration working (1 day)
- [ ] Helpdesk integration configured
- [ ] Security best practices implemented
- [ ] Documentation reviewed

---

## 🔗 Resources

- [JWT.io](https://jwt.io) - JWT debugger and documentation
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken) - Node.js JWT library
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT specification
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

**Status**: ✅ Production Ready

The JWT authentication system is fully implemented and ready for use. All components are in place and tested.
