# API Debugging Guide - Dashboard, Employees, Departments

## Updated Dashboard.jsx with Comprehensive Logging

The Dashboard component now includes detailed console logging for all API operations.

### Console Output When Dashboard Loads

```
[DASHBOARD] API Configuration:
[DASHBOARD] Base URL: http://localhost:5000/api
[DASHBOARD] Token: Present
[DASHBOARD] Authorization Header: Set

[DASHBOARD] Fetching employees from: http://localhost:5000/api/employees
[DASHBOARD] Employees response status: 200
[DASHBOARD] Employees response data: [...]

[DASHBOARD] Fetching departments from: http://localhost:5000/api/departments
[DASHBOARD] Departments response status: 200
[DASHBOARD] Departments response data: [...]

[DASHBOARD] Extracted employees count: 5
[DASHBOARD] Extracted departments count: 3

[DASHBOARD] Stats updated successfully
```

---

## Logging Features Added

### 1. API Configuration Logging
```javascript
console.log('[DASHBOARD] API Configuration:');
console.log('[DASHBOARD] Base URL:', api.defaults.baseURL);
console.log('[DASHBOARD] Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
console.log('[DASHBOARD] Authorization Header:', api.defaults.headers.common['Authorization'] ? 'Set' : 'Not Set');
```

**What it shows:**
- Base URL being used (should be `http://localhost:5000/api`)
- Whether token exists in localStorage
- Whether Authorization header is set

### 2. Token Validation
```javascript
const token = localStorage.getItem('token');
if (!token) {
  console.error('[DASHBOARD] No token found in localStorage');
  setError('Authentication required. Please log in.');
  window.location.href = '/login';
  return;
}
```

**What it does:**
- Checks if token exists before making API calls
- Redirects to login if missing
- Prevents unnecessary API calls

### 3. Request Logging
```javascript
console.log('[DASHBOARD] Fetching employees from:', api.defaults.baseURL + '/employees');
const empRes = await api.get('/employees');
console.log('[DASHBOARD] Employees response status:', empRes.status);
console.log('[DASHBOARD] Employees response data:', empRes.data);
```

**What it shows:**
- Full URL being requested
- HTTP status code (200, 401, 500, etc.)
- Response data structure

### 4. Data Extraction Logging
```javascript
const employees = Array.isArray(empRes.data) ? empRes.data : empRes.data?.data || [];
const departments = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || [];

console.log('[DASHBOARD] Extracted employees count:', employees.length);
console.log('[DASHBOARD] Extracted departments count:', departments.length);
```

**What it shows:**
- How many records were extracted
- Handles multiple response shapes

### 5. Comprehensive Error Logging
```javascript
console.error('[DASHBOARD] API ERROR:', err.response?.status, err.response?.data);
console.error('[DASHBOARD] Full error object:', err);
console.error('[DASHBOARD] Error message:', err.message);
console.error('[DASHBOARD] Error config:', err.config);
```

**What it shows:**
- HTTP status code
- Error response data
- Full error object
- Error message
- Request configuration

### 6. Specific Error Handling
```javascript
if (err.response?.status === 401) {
  console.error('[DASHBOARD] Unauthorized (401) - clearing token and redirecting to login');
  localStorage.removeItem('token');
  window.location.href = '/login';
  return;
}

if (err.response?.status === 500) {
  console.error('[DASHBOARD] Server error (500):', err.response?.data?.message);
  setError(`Server error: ${err.response?.data?.message || 'Internal server error'}`);
  return;
}

if (!err.response) {
  console.error('[DASHBOARD] Network error - no response from server');
  setError('Network error. Please check your connection and ensure the server is running.');
  return;
}
```

**What it handles:**
- 401 Unauthorized: Clears token and redirects to login
- 403 Forbidden: Shows access denied message
- 500 Server Error: Shows backend error message
- 404 Not Found: Shows endpoint not found message
- Network Error: Shows connection error message

---

## How to Debug API Issues

### Step 1: Open Browser Console
1. Press `F12` or `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
2. Go to the "Console" tab
3. Look for `[DASHBOARD]` prefixed logs

### Step 2: Check API Configuration
Look for these logs:
```
[DASHBOARD] Base URL: http://localhost:5000/api
[DASHBOARD] Token: Present
[DASHBOARD] Authorization Header: Set
```

**If Base URL is wrong:**
- Check `.env` file for `VITE_API_URL`
- Check `frontend/src/app/axios.js` baseURL setting

**If Token is Missing:**
- User is not logged in
- Token was cleared
- localStorage is disabled

**If Authorization Header is Not Set:**
- Token interceptor not working
- Check `frontend/src/app/axios.js` request interceptor

### Step 3: Check Request URLs
Look for these logs:
```
[DASHBOARD] Fetching employees from: http://localhost:5000/api/employees
[DASHBOARD] Fetching departments from: http://localhost:5000/api/departments
```

**Verify:**
- URLs are correct
- Base URL matches your backend
- Endpoints exist on backend

### Step 4: Check Response Status
Look for these logs:
```
[DASHBOARD] Employees response status: 200
[DASHBOARD] Departments response status: 200
```

**Status codes:**
- 200: Success
- 401: Unauthorized (token invalid/expired)
- 403: Forbidden (no permission)
- 404: Not found (endpoint doesn't exist)
- 500: Server error

### Step 5: Check Response Data
Look for these logs:
```
[DASHBOARD] Employees response data: [...]
[DASHBOARD] Departments response data: [...]
```

**Verify:**
- Data is an array or has a `.data` property
- Data structure matches expectations
- No unexpected fields

### Step 6: Check Error Messages
If there's an error, look for:
```
[DASHBOARD] API ERROR: 401 {error: "Unauthorized"}
[DASHBOARD] Full error object: Error: Request failed with status code 401
[DASHBOARD] Error message: Request failed with status code 401
```

---

## Common Issues and Solutions

### Issue 1: "Network error - no response from server"
**Cause:** Backend is not running or wrong URL

**Solution:**
1. Check if backend is running: `npm run dev` or `npm start`
2. Check backend port (should be 5000)
3. Check `VITE_API_URL` in `.env`
4. Check `baseURL` in `frontend/src/app/axios.js`

### Issue 2: "Unauthorized (401)"
**Cause:** Token is invalid or expired

**Solution:**
1. Log out and log in again
2. Check if token is stored in localStorage
3. Check if token is being sent in Authorization header
4. Check if backend validates token correctly

### Issue 3: "API endpoint not found (404)"
**Cause:** Endpoint doesn't exist on backend

**Solution:**
1. Check backend routes
2. Verify endpoint paths match
3. Check if backend is running correct version

### Issue 4: "Server error (500)"
**Cause:** Backend error

**Solution:**
1. Check backend console for error messages
2. Check backend logs
3. Verify database connection
4. Check backend error handling

### Issue 5: "No token found in localStorage"
**Cause:** User not logged in

**Solution:**
1. Log in first
2. Check if login is working
3. Check if token is being stored

---

## API Configuration Files

### frontend/src/app/axios.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for attaching the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**Key Points:**
- Base URL: `http://localhost:5000/api` (or from `VITE_API_URL`)
- Request interceptor adds token to Authorization header
- Response interceptor handles 401 errors

### .env File (Frontend)
```
VITE_API_URL=http://localhost:5000/api
```

**If not set:**
- Defaults to `http://localhost:5000/api`
- Can be overridden with environment variable

---

## Employees and Departments Pages

Both pages already have comprehensive logging:

### Employees.jsx Logging
```
[EMPLOYEES] Fetching employees...
[EMPLOYEES] Response received: [...]
[EMPLOYEES] Fetching departments...
[EMPLOYEES] Departments response received: [...]
[EMPLOYEES] State updated successfully
```

### Departments.jsx Logging
```
[DEPARTMENTS] Fetching departments...
[DEPARTMENTS] Response received: [...]
[DEPARTMENTS] Fetching employees...
[DEPARTMENTS] Employees response received: [...]
[DEPARTMENTS] State updated successfully
```

---

## Testing Checklist

- [ ] Open browser console (F12)
- [ ] Navigate to Dashboard
- [ ] Check for `[DASHBOARD]` logs
- [ ] Verify Base URL is correct
- [ ] Verify Token is Present
- [ ] Verify Authorization Header is Set
- [ ] Check response status is 200
- [ ] Check response data is valid
- [ ] Verify stats are displayed
- [ ] Navigate to Employees page
- [ ] Check for `[EMPLOYEES]` logs
- [ ] Navigate to Departments page
- [ ] Check for `[DEPARTMENTS]` logs
- [ ] Test error scenarios (disconnect network, etc.)
- [ ] Verify error messages display correctly

---

## Summary

The Dashboard now includes comprehensive logging for:
1. API configuration (base URL, token, headers)
2. Request URLs and methods
3. Response status codes and data
4. Data extraction and validation
5. Error handling and specific error cases
6. Token validation and authentication

This makes it easy to debug API issues by checking the browser console for `[DASHBOARD]`, `[EMPLOYEES]`, or `[DEPARTMENTS]` prefixed logs.
