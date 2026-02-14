# Database Setup

PostgreSQL database schema and migrations for the HR Management System.

## Setup

1. Install PostgreSQL (if not already installed)

2. Create the database:
```bash
createdb hr_system
```

3. Run the initial migration:
```bash
psql -U postgres -d hr_system -f migrations/001_initial_schema.sql
```

Or use the main schema file:
```bash
psql -U postgres -d hr_system -f schema.sql
```

## Schema Overview

### Departments Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR) - Department name
- `code` (VARCHAR, Unique) - Department code
- `headEmployeeId` (UUID, Foreign Key) - Reference to employee who is department head
- `status` (VARCHAR) - ACTIVE or INACTIVE
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### Employees Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Nullable) - Links to external User system
- `fullName` (VARCHAR) - Employee full name
- `email` (VARCHAR, Unique) - Employee email
- `phone` (VARCHAR) - Phone number
- `departmentId` (UUID, Foreign Key) - Reference to department
- `jobTitle` (VARCHAR) - Job title
- `roleType` (VARCHAR) - ADMIN, HEAD, or EMPLOYEE
- `employmentStatus` (VARCHAR) - ACTIVE or INACTIVE
- `workloadScore` (INTEGER) - Workload score (default 0)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Indexes

- `idx_employees_userId` - Index on userId for faster lookups
- `idx_employees_departmentId` - Index on departmentId
- `idx_employees_email` - Index on email
- `idx_departments_code` - Index on department code
- `idx_departments_headEmployeeId` - Index on headEmployeeId

## Triggers

Automatic `updatedAt` timestamp updates on both tables.
