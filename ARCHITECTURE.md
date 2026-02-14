# HR Management System - Architecture Documentation

## System Overview

The HR Management System is a standalone backend + frontend application that serves as the single source of truth for employees, departments, and job titles. It integrates with external systems (like Help Desk) via REST APIs.

## Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│   (React)       │
│   Port: 3000    │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │
│  (Node.js/      │
│   Express)      │
│   Port: 3001    │
└────────┬────────┘
         │
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘

External Systems:
┌─────────────────┐
│  Help Desk      │───┐
│  System         │   │
└─────────────────┘   │
                      │ REST APIs
┌─────────────────┐   │
│  Auth System    │───┼─── JWT Tokens
│  (External)     │   │
└─────────────────┘   │
                      │
              ┌───────▼───────┐
              │  HR System     │
              │  Integration  │
              │  APIs         │
              └───────────────┘
```

## Data Flow

### User Authentication Flow

1. User logs into Auth System (external)
2. Auth System issues JWT token
3. User accesses HR System with JWT token
4. HR System verifies token and checks for employee record
5. If employee record exists → Allow access
6. If no employee record (and not SUPER_ADMIN) → Block with error

### Employee Creation & Linking Flow

1. SUPER_ADMIN creates Employee record in HR System
2. Employee record initially has `userId = null`
3. SUPER_ADMIN links Employee to User by setting `userId`
4. User can now access HR System (if role allows)

### Department Employee Resolution

1. Help Desk needs to find employees in a department
2. Help Desk calls: `GET /api/hr/employees/by-department/:departmentId`
3. HR System returns list of active employees
4. Help Desk uses this data for task assignment

## Database Schema

### Departments Table

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    headEmployeeId UUID REFERENCES employees(id),
    status VARCHAR(20) CHECK (status IN ('ACTIVE', 'INACTIVE')),
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);
```

### Employees Table

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY,
    userId UUID NULL,  -- Links to external User system
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    departmentId UUID REFERENCES departments(id),
    jobTitle VARCHAR(255) NOT NULL,
    roleType VARCHAR(20) CHECK (roleType IN ('ADMIN', 'HEAD', 'EMPLOYEE')),
    employmentStatus VARCHAR(20) CHECK (employmentStatus IN ('ACTIVE', 'INACTIVE')),
    workloadScore INTEGER DEFAULT 0,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);
```

## API Endpoints

### Admin APIs (SUPER_ADMIN only)

- `POST /api/hr/departments` - Create department
- `PATCH /api/hr/departments/:id` - Update department
- `POST /api/hr/employees` - Create employee
- `PATCH /api/hr/employees/:id` - Update employee (including userId linking)

### View APIs (Role-based access)

- `GET /api/hr/departments` - List all departments
- `GET /api/hr/departments/:id` - Get department details
- `GET /api/hr/employees` - List employees (filtered by role)
- `GET /api/hr/employees/:id` - Get employee details

### Integration APIs (For Help Desk)

- `GET /api/hr/employees/by-user/:userId` - Get employee by user ID
- `GET /api/hr/employees/by-department/:departmentId` - Get department employees
- `GET /api/hr/departments/:id` - Get department details

## Access Control Rules

### SUPER_ADMIN
- ✅ Full access to all departments and employees
- ✅ Can create/edit departments
- ✅ Can create/edit employees
- ✅ Can link employees to users
- ✅ Can access without employee record

### DEPARTMENT_HEAD
- ✅ View-only access to own department
- ✅ View-only access to employees in own department
- ❌ Cannot create/edit departments
- ❌ Cannot create/edit employees
- ❌ Must have employee record linked

### EMPLOYEE
- ✅ View-only access to own profile
- ❌ Cannot view other employees
- ❌ Cannot view departments
- ❌ Must have employee record linked

## Security Considerations

1. **JWT Token Verification**: All endpoints verify JWT tokens
2. **Role-Based Access**: Middleware enforces role-based access control
3. **Employee Record Validation**: Non-SUPER_ADMIN users must have employee records
4. **Foreign Key Constraints**: Database enforces referential integrity
5. **Input Validation**: Express-validator validates all inputs
6. **SQL Injection Prevention**: Parameterized queries via pg library

## Error Handling

### Standard Error Response Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

### Common Error Codes

- `UNAUTHORIZED` - No valid authentication token
- `FORBIDDEN` - Insufficient permissions
- `EMPLOYEE_NOT_FOUND` - Employee record not found (blocks access)
- `DEPARTMENT_NOT_FOUND` - Department not found
- `DEPARTMENT_CODE_EXISTS` - Department code already exists
- `EMAIL_EXISTS` - Employee email already exists
- `INVALID_ROLE` - Invalid role type

## Integration Points

### With Help Desk System

1. **Employee Resolution**: Help Desk queries employees by department
2. **Task Assignment**: Help Desk uses employee data for task assignment
3. **Workload Tracking**: Help Desk updates workload scores via API (future)
4. **User Linking**: Help Desk can verify employee-user linkage

### With Auth System

1. **Token Verification**: HR System verifies JWT tokens from Auth System
2. **User Linking**: Employee records link to User IDs from Auth System
3. **Role Mapping**: HR System maps Auth System roles to HR roles

## Future Enhancements

1. **Workload API**: Allow Help Desk to update workload scores
2. **Analytics Dashboard**: Department-wise workload analytics
3. **PDF Export**: Employee registry and department reports
4. **Audit Logging**: Track all changes to employee/department records
5. **Payroll Integration**: Link to payroll system (future)
6. **Attendance Integration**: Link to attendance system (future)
