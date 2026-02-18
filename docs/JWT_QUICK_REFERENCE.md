# JWT Authentication - Quick Reference

## 🚀 Quick Start (5 minutes)

### 1. Set Environment Variable
```bash
# Generate secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=your-generated-secret-here
JWT_EXPIRES_IN=1d
```

### 2. Start Server
```bash
npm install
npm run dev
```

### 3. Login
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 4. Use Token
```bash
TOKEN="your-token-here"
curl -X GET http://localhost:3002/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📋 Token Payload

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

## 🔐 API Endpoints

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "role": "EMPLOYEE", ... }
}
```

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "fullName": "John Doe",
  "departmentId": "507f1f77bcf86cd799439013",
  "position": "Software Engineer",
  "phone": "+251-9-12-345-678",
  "role": "EMPLOYEE"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "role": "EMPLOYEE", ... }
}
```

### Protected Route
```
GET /api/employees
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Response:
{
  "success": true,
  "data": [ ... ]
}
```

---

## 💻 Code Examples

### JavaScript/Fetch
```javascript
// Login
const res = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await res.json();
localStorage.setItem('authToken', token);

// Use token
const token = localStorage.getItem('authToken');
const data = await fetch('http://localhost:3002/api/employees', {
  headers: { 'Authorization': `Bearer ${token}` }
});
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
```

### Node.js/Express
```javascript
const { authenticate } = require('./middleware/auth');

// Protected route
router.get('/employees', authenticate, (req, res) => {
  console.log('User:', req.user);
  // req.user = { userId, email, role, employeeId, employee }
  res.json({ employees: [] });
});
```

---

## 🔗 Helpdesk Integration

### Share Secret
Both systems must have the same `JWT_SECRET` in `.env`:

```env
# HR System
JWT_SECRET=your-shared-secret-key

# Helpdesk System
JWT_SECRET=your-shared-secret-key
```

### Verify HR Token in Helpdesk
```javascript
const jwt = require('jsonwebtoken');

function verifyHRToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, payload: decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Use in middleware
router.get('/tickets', (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const verification = verifyHRToken(token);
  
  if (!verification.valid) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  req.hrUser = verification.payload;
  next();
});
```

---

## 📁 File Structure

```
/utils/jwt.js                    # JWT utilities
/middleware/auth.js              # Auth middleware
/controllers/authController.js   # Auth logic
/routes/auth.routes.js           # Auth routes
/shared-auth/                    # Shared auth files
  └─ helpdesk-token-verification.js
.env                             # Environment variables
```

---

## ⚙️ Configuration

### Environment Variables
```env
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=1d
MONGODB_URI=mongodb://localhost:27017/hr-system
PORT=3002
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Generate Strong Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| `JWT_SECRET is not defined` | Missing env var | Add `JWT_SECRET` to `.env` |
| `Invalid or expired token` | Token expired or wrong secret | Login again or check secret |
| `No authentication token provided` | Missing header | Add `Authorization: Bearer TOKEN` |
| `Employee record missing` | No employee record | Create employee record |

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is set (min 32 chars)
- [ ] JWT_SECRET not in version control
- [ ] Different secrets per environment
- [ ] HTTPS in production
- [ ] Token expiration set (1 day)
- [ ] Tokens validated on every request
- [ ] User status checked (isActive)
- [ ] Employee record verified
- [ ] Passwords hashed (bcryptjs)
- [ ] CORS configured

---

## 📚 Resources

- [JWT.io](https://jwt.io) - JWT debugger
- [jsonwebtoken npm](https://www.npmjs.com/package/jsonwebtoken)
- [RFC 7519](https://tools.ietf.org/html/rfc7519) - JWT spec
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

## 📞 Support

For issues or questions:
1. Check `.env` configuration
2. Verify JWT_SECRET is set
3. Check token format in Authorization header
4. Review error messages in server logs
5. Use [jwt.io](https://jwt.io) to decode tokens
