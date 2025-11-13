const Lead = require('../models/Lead');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all leads
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const { search, status, source, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by source
    if (source) {
      query.source = source;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      status: 'success',
      count: leads.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        leads
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        lead
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private
exports.createLead = async (req, res) => {
  try {
    // Add createdBy field
    req.body.createdBy = req.user.id;

    // If no assignedTo, assign to creator
    if (!req.body.assignedTo) {
      req.body.assignedTo = req.user.id;
    }

    const lead = await Lead.create(req.body);

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'CREATE',
      module: 'Lead',
      recordId: lead._id,
      recordTitle: `${lead.firstName} ${lead.lastName}`
    }, req);

    res.status(201).json({
      status: 'success',
      data: {
        lead
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found'
      });
    }

    // Store old values for activity log
    const oldValues = { ...lead.toObject() };

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'UPDATE',
      module: 'Lead',
      recordId: lead._id,
      recordTitle: `${lead.firstName} ${lead.lastName}`,
      changes: {
        before: oldValues,
        after: lead.toObject()
      }
    }, req);

    res.status(200).json({
      status: 'success',
      data: {
        lead
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found'
      });
    }

    const leadTitle = `${lead.firstName} ${lead.lastName}`;

    await lead.deleteOne();

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'DELETE',
      module: 'Lead',
      recordId: req.params.id,
      recordTitle: leadTitle
    }, req);

    res.status(200).json({
      status: 'success',
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
