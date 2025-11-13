const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Deal amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  stage: {
    type: String,
    enum: ['New', 'In Progress', 'Won', 'Lost'],
    default: 'New',
    required: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  expectedCloseDate: {
    type: Date,
    required: [true, 'Expected close date is required']
  },
  actualCloseDate: {
    type: Date
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: [true, 'Contact is required']
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lostReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
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
});

// Update updatedAt on save
dealSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Set actualCloseDate when stage is Won or Lost
  if ((this.stage === 'Won' || this.stage === 'Lost') && !this.actualCloseDate) {
    this.actualCloseDate = Date.now();
  }

  // Set probability based on stage
  if (this.stage === 'New' && !this.isModified('probability')) {
    this.probability = 10;
  } else if (this.stage === 'In Progress' && !this.isModified('probability')) {
    this.probability = 50;
  } else if (this.stage === 'Won') {
    this.probability = 100;
  } else if (this.stage === 'Lost') {
    this.probability = 0;
  }

  next();
});

// Create index for search optimization
dealSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Deal', dealSchema);
