const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/hr-system';

async function setup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to HR-system MongoDB');

    // 1. Create Department
    let engDept = await Department.findOne({ code: 'ENG' });
    if (!engDept) {
      engDept = await Department.create({
        name: 'Engineering',
        code: 'ENG'
      });
      console.log('✓ Created Engineering Department');
    }

    const password = 'Test@1234'; // Consistent with Helpdesk seed

    const users = [
      { email: 'eng.head@helpdesk.com', fullName: 'Eng Head', role: 'DEPARTMENT_HEAD', employeeCode: 'ENG001' },
      { email: 'engineer2@helpdesk.com', fullName: 'Engineer Two', role: 'EMPLOYEE', employeeCode: 'ENG002' },
      { email: 'engineer3@helpdesk.com', fullName: 'Engineer Three', role: 'EMPLOYEE', employeeCode: 'ENG003' }
    ];

    for (const u of users) {
      // Create User
      let user = await User.findOne({ email: u.email });
      if (user) await User.deleteOne({ _id: user._id });
      
      user = await User.create({
        email: u.email,
        password: password,
        role: 'EMPLOYEE', // User model only allows ADMIN, HR, EMPLOYEE
        isActive: true
      });

      // Create Employee
      let emp = await Employee.findOne({ email: u.email });
      if (emp) await Employee.deleteOne({ _id: emp._id });

      emp = await Employee.create({
        userId: user._id,
        role: u.role,
        employeeCode: u.employeeCode,
        fullName: u.fullName,
        email: u.email,
        departmentId: engDept._id,
        position: u.role === 'DEPARTMENT_HEAD' ? 'Department Head' : 'Software Engineer',
        status: 'ACTIVE'
      });

      console.log(`✓ Set up ${u.role}: ${u.email}`);

      if (u.role === 'DEPARTMENT_HEAD') {
        engDept.headEmployeeId = emp._id;
        await engDept.save();
        console.log(`✓ Assigned ${u.email} as head of Engineering`);
      }
    }

    console.log('\n✅ HR-system setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

setup();
