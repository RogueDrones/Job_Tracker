// # backend/src/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    get: function(date) {
      // Convert UTC to NZ time for display
      if (date) {
        const nzOffset = 12; // NZ is UTC+12 (approximate, doesn't account for DST)
        return new Date(date.getTime() + (nzOffset * 60 * 60 * 1000));
      }
      return date;
    },
    default: function() {
      // Set default date in NZ timezone
      const now = new Date();
      const nzOffset = 12;
      return new Date(now.getTime() + (nzOffset * 60 * 60 * 1000));
    }
  },
  startTime: {
    type: Date,
    required: true,
    get: function(date) {
      if (date) {
        const nzOffset = 12;
        return new Date(date.getTime() + (nzOffset * 60 * 60 * 1000));
      }
      return date;
    }
  },
  endTime: {
    type: Date,
    required: true,
    get: function(date) {
      if (date) {
        const nzOffset = 12;
        return new Date(date.getTime() + (nzOffset * 60 * 60 * 1000));
      }
      return date;
    }
  },
  duration: {
    type: Number,  // Duration in minutes
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true }
});

// Calculate duration before saving
JobSchema.pre('save', function(next) {
  // Update duration if start and end times are available
  if (this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  // Update the updatedAt timestamp
  this.updatedAt = Date.now();
  
  next();
});

module.exports = mongoose.model('Job', JobSchema);