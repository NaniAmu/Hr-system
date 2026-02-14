/**
 * User Model
 * Mongoose schema for authentication users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ['ADMIN', 'HR', 'HR_ADMIN', 'DEPARTMENT_HEAD', 'EMPLOYEE', 'AGENT'], default: 'EMPLOYEE' },
  isActive: { type: Boolean, default: true },
  
  fullName: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  position: { type: String, required: true }
}, {
  timestamps: true
});


// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
