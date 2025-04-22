// # backend/src/models/Job.js
const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  startTime: {
    type: Date,
    required: [true, 'Please add a start time'],
    get: function(date) {
      // Convert UTC to NZ time for display
      if (date) {
        const nzOffset = 12;
        return new Date(date.getTime() - (nzOffset * 60 * 60 * 1000));
      }
      return date;
    }
  },
  endTime: {
    type: Date,
    required: [true, 'Please add an end time'],
    get: function(date) {
      // Convert UTC to NZ time for display
      if (date) {
        const nzOffset = 12;
        return new Date(date.getTime() - (nzOffset * 60 * 60 * 1000));
      }
      return date;
    }
  },
  duration: {
    type: Number,  // Duration in minutes
    required: true
  },
  photos: [{
    url: {
      type: String,
      trim: true
    },
    caption: {
      type: String,
      trim: true
    },
    takenAt: {
      type: Date
    }
  }],
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
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true }
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