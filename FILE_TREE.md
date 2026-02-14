# HR System Backend - File Tree

## Project Structure

```
hr-system/
├── package.json              # Root package.json (backend dependencies)
├── server.js                 # Main server entry point
│
├── config/
│   └── database.js           # PostgreSQL connection pool
│
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── authorize.js          # Role-based authorization middleware
│
├── models/
│   ├── Department.js         # Department database model
│   └── Employee.js           # Employee database model
│
├── controllers/
│   ├── departmentController.js  # Department API handlers
│   └── employeeController.js   # Employee API handlers
│
├── routes/
│   ├── departments.js        # Department routes
│   └── employees.js          # Employee routes
│
├── shared-auth/
│   └── jwt-utils.js          # JWT utilities (shared with Help Desk)
│
├── database/
│   ├── schema.sql            # Database schema
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── README.md
│
├── frontend/                 # React frontend (separate project)
│   └── ...
│
└── Documentation files:
    ├── README.md
    ├── SETUP.md
    ├── ARCHITECTURE.md
    └── PROJECT_SUMMARY.md
```

## Backend Files (Root Level)

### Core Files
- `package.json` - Node.js dependencies and scripts
- `server.js` - Express server entry point

### Configuration
- `config/database.js` - PostgreSQL connection configuration

### Middleware
- `middleware/auth.js` - JWT token verification and user extraction
- `middleware/authorize.js` - Role-based access control (SUPER_ADMIN, DEPARTMENT_HEAD, EMPLOYEE)

### Models
- `models/Department.js` - Department database operations
- `models/Employee.js` - Employee database operations

### Controllers
- `controllers/departmentController.js` - Department API business logic
- `controllers/employeeController.js` - Employee API business logic

### Routes
- `routes/departments.js` - Department API endpoints
- `routes/employees.js` - Employee API endpoints

## Key Points

1. **Root Structure**: All backend files are at the project root level
2. **package.json**: Located at root, contains all backend dependencies
3. **server.js**: Located at root, main entry point for the Node.js application
4. **Modular Organization**: Code organized into logical folders (config, middleware, models, controllers, routes)
5. **No Backend Subfolder**: Backend code is directly in the project root

## Running the Backend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```
