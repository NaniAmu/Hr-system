const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // same as your login code
const User = require('./models/User'); // your User model

async function resetAdmin() {
  await mongoose.connect('mongodb://localhost:27017/hr_system'); // your DB

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Upsert admin user
  await User.updateOne(
    { email: 'admin@example.com' },
    { $set: { password: hashedPassword, role: 'ADMIN' } },
    { upsert: true }
  );

  console.log('✅ Admin credentials reset: admin@example.com / admin123');

  await mongoose.connection.close();
  process.exit(0);
}

resetAdmin().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
