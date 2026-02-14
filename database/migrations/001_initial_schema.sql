-- Migration: Initial Schema
-- Run this first to create the base tables

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    headEmployeeId UUID NULL, -- Will reference employees after creation
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userId UUID NULL, -- Links to external User system (nullable initially)
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    departmentId UUID REFERENCES departments(id) ON DELETE SET NULL,
    jobTitle VARCHAR(255) NOT NULL,
    roleType VARCHAR(20) NOT NULL CHECK (roleType IN ('ADMIN', 'HEAD', 'EMPLOYEE')),
    employmentStatus VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (employmentStatus IN ('ACTIVE', 'INACTIVE')),
    workloadScore INTEGER DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for department head
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_headEmployeeId 
FOREIGN KEY (headEmployeeId) REFERENCES employees(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_userId ON employees(userId);
CREATE INDEX IF NOT EXISTS idx_employees_departmentId ON employees(departmentId);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_departments_code ON departments(code);
CREATE INDEX IF NOT EXISTS idx_departments_headEmployeeId ON departments(headEmployeeId);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updatedAt
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
