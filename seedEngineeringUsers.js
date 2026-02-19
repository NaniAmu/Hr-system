#!/usr/bin/env node
/**
 * Seed Engineering Users for HR System
 * 
 * Creates:
 * - Engineering department (if not exists)
 * - Department Head: eng.head@helpdesk.com
 * - Engineers: engineer1@helpdesk.com, engineer2@helpdesk.com
 * 
 * All passwords are hashed with bcrypt (10 rounds)
 * All users are linked to Engineering department
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

// Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-system';
const DEFAULT_PASSWORD = 'Test@1234';

console.log('🔧 HR System - Engineering Users Seed\n');
console.log('=' .repeat(50));

async function seedEngineeringUsers() {
  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Step 1: Ensure Engineering department exists
    console.log('📁 Step 1: Engineering Department');
    let engineeringDept = await Department.findOne({ code: 'ENG' });
    
    if (!engineeringDept) {
      console.log('   Creating Engineering department...');
      engineeringDept = await Department.create({
        name: 'Engineering',
        code: 'ENG',
        headEmployeeId: null
      });
      console.log('   ✅ Engineering department created');
    } else {
      console.log('   ✅ Engineering department exists');
    }
    console.log(`   Department ID: ${engineeringDept._id}\n`);

    // Step 2: Create Department Head
    console.log('👤 Step 2: Department Head');
    const headUser = await createUserAndEmployee({
      email: 'eng.head@helpdesk.com',
      role: 'EMPLOYEE',  // User role
      employeeRole: 'DEPARTMENT_HEAD',  // Employee role
      employeeCode: 'ENG001',
      fullName: 'Engineering Department Head',
      profession: 'Engineering Manager',
      departmentId: engineeringDept._id
    });
    
    // Update department head reference
    engineeringDept.headEmployeeId = headUser.employeeId;
    await engineeringDept.save();
    console.log('   ✅ Department head assigned to Engineering\n');

    // Step 3: Create Engineers
    console.log('👨‍💻 Step 3: Engineers');
    
    await createUserAndEmployee({
      email: 'engineer1@helpdesk.com',
      role: 'EMPLOYEE',
      employeeRole: 'EMPLOYEE',
      employeeCode: 'ENG002',
      fullName: 'Engineer One',
      profession: 'Software Engineer',
      departmentId: engineeringDept._id
    });
    
    await createUserAndEmployee({
      email: 'engineer2@helpdesk.com',
      role: 'EMPLOYEE',
      employeeRole: 'EMPLOYEE',
      employeeCode: 'ENG003',
      fullName: 'Engineer Two',
      profession: 'Software Engineer',
      departmentId: engineeringDept._id
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Seed completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   • Engineering department: ENG');
    console.log('   • Department Head: eng.head@helpdesk.com');
    console.log('   • Engineers: engineer1@helpdesk.com, engineer2@helpdesk.com');
    console.log(`   • Password for all: ${DEFAULT_PASSWORD}`);
    console.log('\n🔐 All passwords are securely hashed with bcrypt.\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📡 MongoDB connection closed');
  }
}

/**
 * Create User and linked Employee record
 */
async function createUserAndEmployee({ email, role, employeeRole, employeeCode, fullName, profession, departmentId }) {
  // Check if user exists
  let user = await User.findOne({ email });
  
  if (user) {
    console.log(`   ⚠️  User ${email} already exists, skipping...`);
    
    // Check if employee record exists
    let employee = await Employee.findOne({ userId: user._id });
    if (employee) {
      return { userId: user._id, employeeId: employee._id };
    }
    
    // Create employee record if missing
    employee = await Employee.create({
      userId: user._id,
      role: employeeRole,
      employeeCode,
      fullName,
      email,
      profession,
      position: profession,  // For backward compatibility
      departmentId,
      status: 'ACTIVE'
    });
    console.log(`   ✅ Created employee record for: ${email}`);
    return { userId: user._id, employeeId: employee._id };
  }

  // Create User (password auto-hashed by UserSchema.pre('save'))
  user = await User.create({
    email,
    password: DEFAULT_PASSWORD,  // Will be hashed automatically
    role,
    isActive: true
  });
  console.log(`   ✅ Created user: ${email} (${role})`);

  // Create linked Employee record
  const employee = await Employee.create({
    userId: user._id,
    role: employeeRole,
    employeeCode,
    fullName,
    email,
    profession,
    position: profession,  // For backward compatibility
    departmentId,
    status: 'ACTIVE'
  });
  console.log(`   ✅ Created employee: ${fullName} (${employeeCode}) - ${employeeRole}`);

  return { userId: user._id, employeeId: employee._id };
}

// Run seed
seedEngineeringUsers();
