/**
 * Department Model
 * Mongoose schema for departments
 */

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  headEmployeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
departmentSchema.index({ headEmployeeId: 1 });

// Virtual for populating head employee
departmentSchema.virtual('headEmployee', {
  ref: 'Employee',
  localField: 'headEmployeeId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included in JSON
departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
