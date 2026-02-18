# HR Management System - Setup Guide

Complete setup instructions for the Government HR Management System.

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Quick Start

### 1. Database Setup

```bash
# Create database
createdb hr_system

# Run migrations
cd database
psql -U postgres -d hr_system -f migrations/001_initial_schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and update values)
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:3001" > .env

# Start frontend development server
npm run dev
```

Frontend will run on `http://localhost:3004`

## Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hr_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3004
```

**Important**: The `JWT_SECRET` must match the secret used in your Help Desk system for token verification.

### Frontend Environment Variables (Optional)

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Initial Data Setup

### Creating First SUPER_ADMIN Employee

Since SUPER_ADMIN can access without an employee record, you can:

1. Use your auth system to get a JWT token with SUPER_ADMIN role
2. Access the HR system directly
3. Create departments and employees through the UI

### Creating Departments

1. Login as SUPER_ADMIN
2. Navigate to "Departments" from dashboard
3. Click "Create Department"
4. Fill in:
   - Department Name
   - Department Code (unique)
   - Status (ACTIVE/INACTIVE)

### Creating Employees

1. Login as SUPER_ADMIN
2. Navigate to "Employees" from dashboard
3. Click "Create Employee"
4. Fill in:
   - Full Name
   - Email (unique)
   - Phone (optional)
   - Department (select from dropdown)
   - Job Title
   - Role Type (ADMIN/HEAD/EMPLOYEE)
   - Employment Status
   - User ID (optional - for linking to auth system)

### Linking Employee to User

After creating an employee:

1. Get the User ID from your auth system
2. Edit the employee record
3. Set the `userId` field to link the employee to the user account

**Important**: Non-SUPER_ADMIN users MUST have their employee record linked to their user account, otherwise they will be blocked with "Employee record not found" error.

## API Testing

### Using cURL

```bash
# Get departments (requires JWT token)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/hr/departments

# Get employees
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/hr/employees

# Get employee by user ID (Integration API)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/hr/employees/by-user/USER_ID
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `backend/.env`
- Ensure database exists: `psql -l | grep hr_system`

### Authentication Issues

- Verify JWT_SECRET matches your auth system
- Check token expiration
- Ensure token includes `userId` and `role` claims

### Employee Not Found Error

- Verify employee record exists in database
- Check that `userId` is correctly linked
- Ensure `employmentStatus` is 'ACTIVE'
- SUPER_ADMIN can bypass this check

### CORS Issues

- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check browser console for CORS errors

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
3. Configure proper CORS origins
4. Use environment-specific database credentials
5. Build frontend: `cd frontend && npm run build`
6. Serve frontend build with nginx or similar
7. Use PM2 or similar for backend process management

## Integration with Help Desk

The HR system exposes integration APIs that the Help Desk system can consume:

- `GET /api/hr/employees/by-user/:userId` - Get employee by user ID
- `GET /api/hr/employees/by-department/:departmentId` - Get department employees
- `GET /api/hr/departments/:id` - Get department details

Ensure both systems share the same JWT_SECRET for token verification.
