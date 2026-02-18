/**
 * Employee Model
 * Mongoose schema for employees
 * CRITICAL: Every authenticated user MUST have an employee record
 */

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    required: true,
    enum: ['ADMIN', 'HR', 'HR_ADMIN', 'DEPARTMENT_HEAD', 'EMPLOYEE']
  },
  employeeCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    // unique creates an index; keep just one definition to avoid duplicate index warnings
  },
  phone: {
    type: String,
    trim: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  // "profession" is the canonical job field (requested).
  // Keep "position" for backward compatibility with existing UI/integration.
  profession: {
    type: String,
    default: null,
    trim: true
  },
  position: {
    type: String,
    default: null,
    trim: true
  },
  // Task counters (synced from Helpdesk or computed elsewhere)
  openTasks: {
    type: Number,
    default: 0,
    min: 0
  },
  inProgressTasks: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  },
  hiredAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
// Note: userId and email are uniquely indexed via `unique: true` field definitions.
// Compound index for department queries with status filter
employeeSchema.index({ departmentId: 1, status: 1 });

// Virtual for populating department
employeeSchema.virtual('department', {
  ref: 'Department',
  localField: 'departmentId',
  foreignField: '_id',
  justOne: true
});

// Dynamic workload score (requested): openTasks + inProgressTasks
employeeSchema.virtual('workloadScore').get(function workloadScore() {
  const open = typeof this.openTasks === 'number' ? this.openTasks : 0;
  const inProgress = typeof this.inProgressTasks === 'number' ? this.inProgressTasks : 0;
  return open + inProgress;
});

// Ensure virtuals are included in JSON
employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
