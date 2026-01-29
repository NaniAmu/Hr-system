# HR Management System - MongoDB Backend

Standalone HR Management System built with Node.js, Express, and MongoDB (Mongoose).

## Architecture

- **Backend**: Node.js/Express with MongoDB (Mongoose)
- **Database**: MongoDB
- **Authentication**: JWT (shared with Help Desk system via `shared-auth/jwt-utils.js`)

## Project Structure

```
hr-system/
├── package.json              # Root package.json
├── server.js                 # Main server entry point
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── Employee.js          # Employee Mongoose schema
│   └── Department.js       # Department Mongoose schema
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── authorize.js         # Role-based authorization
├── controllers/
│   ├── employeeController.js
│   ├── departmentController.js
│   └── workloadController.js
├── routes/
│   ├── employees.js
│   └── workload.js
└── shared-auth/
    └── jwt-utils.js          # Shared JWT utilities
```

## Roles & Access

- **ADMIN**: Full access, no employee record required
- **HR**: Create/edit employees and departments
- **DEPARTMENT_HEAD**: View-only access to employees in their department, view workload analytics
- **EMPLOYEE**: Self profile only

## Core Requirements

1. **Employee Model (MANDATORY)**
   - Each authenticated user must have one Employee record
   - Employee links to User via `userId`
   - System BLOCKS access if employee profile is missing (except ADMIN)

2. **Error Handling**
   - Error Code: `EMPLOYEE_RECORD_MISSING`
   - Message: "User account not linked to employee profile"

## API Endpoints

### Employees
- `POST /hr/employees` - Create employee (HR only)
- `GET /hr/employees/me` - Get current user's profile
- `GET /hr/employees/department/:id` - Get employees by department
- `GET /hr/employees/:id` - Get employee by ID
- `PATCH /hr/employees/:id` - Update employee (HR only)

### Workload
- `GET /hr/workload/department/:id` - Get department workload analytics

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hr_system
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
```

3. **Start MongoDB:**
```bash
# Make sure MongoDB is running
mongod
```

4. **Start the server:**
```bash
npm run dev
```

## Security

- JWT authentication middleware on all endpoints
- Role-based authorization middleware
- Employee record validation (blocks access if missing)
- Input validation with express-validator

## Error Codes

- `UNAUTHORIZED` - No valid authentication token
- `FORBIDDEN` - Insufficient permissions
- `EMPLOYEE_RECORD_MISSING` - User account not linked to employee profile
- `EMPLOYEE_NOT_FOUND` - Employee not found
- `DEPARTMENT_NOT_FOUND` - Department not found
- `EMAIL_EXISTS` - Employee email already exists
- `USER_ALREADY_LINKED` - User ID already linked to an employee
