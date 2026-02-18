require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hr_system');
    console.log('Connected to MongoDB');

    // Create IT Department
    let dept = await Department.findOne({ code: 'IT' });
    if (!dept) {
      dept = await Department.create({
        name: 'IT Department',
        code: 'IT',
        status: 'ACTIVE'
      });
      console.log('✓ Created IT Department');
    }

    // Delete existing user and employee
    await User.deleteOne({ email: 'admin@example.com' });
    await Employee.deleteOne({ email: 'admin@example.com' });

    // Create Admin User
    const user = await User.create({
        email: 'admin@example.com',
        password: 'adminHr123',
        role: 'ADMIN',
        isActive: true,
        fullName: 'Admin User',
        department: dept._id,
        position: 'System Administrator'
    });
    console.log('✓ Created Admin User');

    // Create Admin Employee
    const emp = await Employee.create({
        userId: user._id,
        role: 'ADMIN',
        employeeCode: 'EMP001',
        fullName: 'Admin User',
        email: 'admin@example.com',
        departmentId: dept._id,
        position: 'System Administrator',
        status: 'ACTIVE',
        hiredAt: new Date()
    });
    console.log('✓ Created Admin Employee');

    console.log('\n✅ Seed completed!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: adminHr123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
