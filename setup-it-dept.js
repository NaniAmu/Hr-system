/**
 * Setup IT Department users and employees
 * Run this in the hr-system directory
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const IT_DEPT_ID = '699535dcc1c9aa20d0ebdbfd';

async function setupITDepartment() {
  try {
    // Connect to HR database
    await mongoose.connect('mongodb://localhost:27017/hr_system');
    console.log('Connected to HR database');

    const User = require('./models/User');
    const Employee = require('./models/Employee');
    const Department = require('./models/Department');

    // 1. Create IT Department Head
    const headPassword = await bcrypt.hash('Test@1234', 10);
    
    let headUser = await User.findOne({ email: 'taggeesse@gmail.com' });
    if (!headUser) {
      headUser = await User.create({
        email: 'taggeesse@gmail.com',
        password: headPassword,
        role: 'DEPARTMENT_HEAD',
        isActive: true,
        profile: {
          firstName: 'Tagesse',
          lastName: 'IT Head',
          phone: '+251911000001'
        }
      });
      console.log('✅ IT Department Head user created:', headUser._id.toString());
    } else {
      console.log('ℹ️ IT Department Head user exists:', headUser._id.toString());
    }

    // Create/update employee record for head
    let headEmployee = await Employee.findOne({ userId: headUser._id });
    if (!headEmployee) {
      headEmployee = await Employee.create({
        userId: headUser._id,
        departmentId: IT_DEPT_ID,
        employeeId: 'IT-HEAD-001',
        employeeCode: 'IT-HD-001',
        fullName: 'Tagesse IT Head',
        email: 'taggeesse@gmail.com',
        phone: '+251911000001',
        role: 'DEPARTMENT_HEAD',
        status: 'ACTIVE',
        hireDate: new Date('2024-01-01'),
        position: 'IT Department Head',
        salary: {
          base: 80000,
          currency: 'USD'
        },
        contactInfo: {
          email: 'taggeesse@gmail.com',
          phone: '+251911000001',
          address: 'Addis Ababa, Ethiopia'
        }
      });
      console.log('✅ IT Department Head employee created:', headEmployee._id.toString());
    } else {
      headEmployee.departmentId = IT_DEPT_ID;
      headEmployee.status = 'ACTIVE';
      headEmployee.role = 'DEPARTMENT_HEAD';
      await headEmployee.save();
      console.log('✅ IT Department Head employee updated');
    }

    // 2. Create IT Employees
    const itEmployees = [
      { email: 'it1@helpdesk.com', firstName: 'IT', lastName: 'Engineer 1', phone: '+251911000002', position: 'IT Engineer', empId: 'IT-EMP-001' },
      { email: 'it2@helpdesk.com', firstName: 'IT', lastName: 'Engineer 2', phone: '+251911000003', position: 'IT Specialist', empId: 'IT-EMP-002' },
      { email: 'it3@helpdesk.com', firstName: 'IT', lastName: 'Engineer 3', phone: '+251911000004', position: 'System Admin', empId: 'IT-EMP-003' }
    ];

    for (const empData of itEmployees) {
      let user = await User.findOne({ email: empData.email });
      if (!user) {
        const password = await bcrypt.hash('Test@1234', 10);
        user = await User.create({
          email: empData.email,
          password: password,
          role: 'EMPLOYEE',
          isActive: true,
          profile: {
            firstName: empData.firstName,
            lastName: empData.lastName,
            phone: empData.phone
          }
        });
        console.log(`✅ IT Employee user created: ${empData.email}`);
      }

      let employee = await Employee.findOne({ userId: user._id });
      if (!employee) {
        employee = await Employee.create({
          userId: user._id,
          departmentId: IT_DEPT_ID,
          employeeId: empData.empId,
          employeeCode: empData.empId.replace('IT-', 'ITC-'),
          fullName: `${empData.firstName} ${empData.lastName}`,
          email: empData.email,
          phone: empData.phone,
          role: 'EMPLOYEE',
          status: 'ACTIVE',
          hireDate: new Date('2024-01-01'),
          position: empData.position,
          salary: {
            base: 50000,
            currency: 'USD'
          },
          contactInfo: {
            email: empData.email,
            phone: empData.phone,
            address: 'Addis Ababa, Ethiopia'
          }
        });
        console.log(`✅ IT Employee record created: ${empData.firstName} ${empData.lastName}`);
      } else {
        employee.departmentId = IT_DEPT_ID;
        employee.status = 'ACTIVE';
        await employee.save();
        console.log(`✅ IT Employee updated: ${empData.email}`);
      }
    }

    // 3. Update IT Department with head
    const itDept = await Department.findById(IT_DEPT_ID);
    if (itDept) {
      itDept.head = headUser._id;
      await itDept.save();
      console.log('✅ IT Department head assigned');
    }

    // Summary
    console.log('\n📋 IT Department Setup Summary:');
    console.log('Department ID:', IT_DEPT_ID);
    console.log('Department Head: taggeesse@gmail.com / Test@1234');
    console.log('IT Employees:');
    itEmployees.forEach(emp => console.log(`  - ${emp.email} / Test@1234`));

    await mongoose.connection.close();
    console.log('\n✅ IT Department setup complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupITDepartment();
