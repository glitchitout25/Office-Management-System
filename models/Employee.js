const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title must be less than 100 characters']
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    validate: {
      validator: function(v) {
        // Employee cannot be their own supervisor
        return !v || !this._id || !v.equals(this._id);
      },
      message: 'Employee cannot be their own supervisor'
    }
  },
  salary: {
    type: Number,
    min: [0, 'Salary cannot be negative'],
    required: [true, 'Salary is required']
  },
  hireDate: {
    type: Date,
    required: [true, 'Hire date is required'],
    validate: {
      validator: function(v) {
        return v <= new Date();
      },
      message: 'Hire date cannot be in the future'
    }
  },
  // Location data from external API
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address must be less than 200 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profileImage: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to get full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual to get subordinates (employees supervised by this employee)
employeeSchema.virtual('subordinates', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'supervisor'
});

// Index for better query performance
employeeSchema.index({ department: 1 });
employeeSchema.index({ supervisor: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });
employeeSchema.index({ jobTitle: 1 });
employeeSchema.index({ isActive: 1 });

// Compound index for search functionality
employeeSchema.index({ 
  firstName: 'text', 
  lastName: 'text', 
  email: 'text',
  jobTitle: 'text'
});

module.exports = mongoose.model('Employee', employeeSchema);