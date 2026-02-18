# Console Logging Quick Reference

## How to View Logs

1. Open browser: Press `F12` or `Ctrl+Shift+I`
2. Click "Console" tab
3. Look for logs with prefixes: `[DASHBOARD]`, `[EMPLOYEES]`, `[DEPARTMENTS]`

---

## Dashboard Logs

### Successful Load
```
[DASHBOARD] API Configuration:
[DASHBOARD] Base URL: http://localhost:5000/api
[DASHBOARD] Token: Present
[DASHBOARD] Authorization Header: Set

[DASHBOARD] Fetching employees from: http://localhost:5000/api/employees
[DASHBOARD] Employees response status: 200
[DASHBOARD] Employees response data: Array(5)

[DASHBOARD] Fetching departments from: http://localhost:5000/api/departments
[DASHBOARD] Departments response status: 200
[DASHBOARD] Departments response data: Array(3)

[DASHBOARD] Extracted employees count: 5
[DASHBOARD] Extracted departments count: 3

[DASHBOARD] Stats updated successfully
```

### Missing Token
```
[DASHBOARD] API Configuration:
[DASHBOARD] Base URL: http://localhost:5000/api
[DASHBOARD] Token: Missing
[DASHBOARD] Authorization Header: Not Set

[DASHBOARD] No token found in localStorage
```

### 401 Unauthorized
```
[DASHBOARD] API ERROR: 401 {error: "Unauthorized"}
[DASHBOARD] Full error object: Error: Request failed with status code 401
[DASHBOARD] Error message: Request failed with status code 401
[DASHBOARD] Unauthorized (401) - clearing token and redirecting to login
```

### 500 Server Error
```
[DASHBOARD] API ERROR: 500 {message: "Internal server error"}
[DASHBOARD] Full error object: Error: Request failed with status code 500
[DASHBOARD] Error message: Request failed with status code 500
[DASHBOARD] Server error (500): Internal server error
```

### Network Error
```
[DASHBOARD] API ERROR: undefined undefined
[DASHBOARD] Full error object: Error: Network Error
[DASHBOARD] Error message: Network Error
[DASHBOARD] Network error - no response from server
```

---

## Employees Page Logs

### Successful Load
```
[EMPLOYEES] Fetching employees...
[EMPLOYEES] Response received: Array(5)

[EMPLOYEES] Fetching departments...
[EMPLOYEES] Departments response received: Array(3)

[EMPLOYEES] State updated successfully
```

### Error
```
[EMPLOYEES] Error fetching data: Error: Request failed with status code 401
[EMPLOYEES] Unauthorized - redirecting to login
```

---

## Departments Page Logs

### Successful Load
```
[DEPARTMENTS] Fetching departments...
[DEPARTMENTS] Response received: Array(3)

[DEPARTMENTS] Fetching employees...
[DEPARTMENTS] Employees response received: Array(5)

[DEPARTMENTS] State updated successfully
```

### Error
```
[DEPARTMENTS] Error fetching data: Error: Request failed with status code 401
[DEPARTMENTS] Unauthorized - redirecting to login
```

---

## What Each Log Means

| Log | Meaning |
|-----|---------|
| `Base URL: http://localhost:5000/api` | API endpoint is configured correctly |
| `Token: Present` | User is logged in and token is stored |
| `Authorization Header: Set` | Token is being sent with requests |
| `Response status: 200` | Request succeeded |
| `Response status: 401` | Token is invalid or expired |
| `Response status: 403` | User doesn't have permission |
| `Response status: 404` | Endpoint doesn't exist |
| `Response status: 500` | Backend error |
| `Network Error` | Backend is not running or unreachable |
| `State updated successfully` | Data was loaded and displayed |

---

## Troubleshooting Steps

### Step 1: Check if Backend is Running
```
Expected: [DASHBOARD] Employees response status: 200
If Missing: Network error or backend not running
```

### Step 2: Check if Token is Valid
```
Expected: [DASHBOARD] Token: Present
If Missing: User not logged in
```

### Step 3: Check if Authorization Header is Set
```
Expected: [DASHBOARD] Authorization Header: Set
If Not Set: Token interceptor not working
```

### Step 4: Check Response Status
```
Expected: 200
If 401: Token expired, log in again
If 404: Endpoint doesn't exist
If 500: Backend error
```

### Step 5: Check Response Data
```
Expected: Array(5) or similar
If Empty: No data in database
If Error: Check error message
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Network error - no response from server` | Backend not running | Start backend server |
| `Unauthorized (401)` | Token invalid/expired | Log in again |
| `API endpoint not found (404)` | Wrong endpoint | Check backend routes |
| `Server error (500)` | Backend error | Check backend logs |
| `No token found in localStorage` | Not logged in | Log in first |

---

## Files with Logging

- ✅ `frontend/src/features/dashboard/Dashboard.jsx` - Dashboard logs
- ✅ `frontend/src/pages/hr/Employees.jsx` - Employees logs
- ✅ `frontend/src/pages/hr/Departments.jsx` - Departments logs

All three pages now have comprehensive console logging for debugging API issues.

---

## How to Report Issues

When reporting an API issue, include:

1. **Console logs** (copy from browser console)
2. **Base URL** (from `[DASHBOARD] Base URL:` log)
3. **Token status** (from `[DASHBOARD] Token:` log)
4. **Response status** (from `[DASHBOARD] ... response status:` log)
5. **Error message** (from `[DASHBOARD] API ERROR:` log)

Example:
```
Base URL: http://localhost:5000/api
Token: Present
Response Status: 401
Error: Unauthorized
```

This helps identify the issue quickly.
