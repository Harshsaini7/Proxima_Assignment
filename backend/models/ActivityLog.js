const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
    required: true
  },
  module: {
    type: String,
    enum: ['Lead', 'Contact', 'Deal', 'User', 'Auth'],
    required: true
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId
  },
  recordTitle: {
    type: String,
    trim: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create index for efficient querying
activityLogSchema.index({ user: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, recordId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
