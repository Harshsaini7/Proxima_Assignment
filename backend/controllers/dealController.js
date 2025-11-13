const Deal = require('../models/Deal');
const { logActivity } = require('../utils/activityLogger');

// @desc    Get all deals
// @route   GET /api/deals
// @access  Private
exports.getDeals = async (req, res) => {
  try {
    const { search, stage, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by stage
    if (stage) {
      query.stage = stage;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const deals = await Deal.find(query)
      .populate('contact', 'firstName lastName email company')
      .populate('lead', 'firstName lastName email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Deal.countDocuments(query);

    res.status(200).json({
      status: 'success',
      count: deals.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        deals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Private
exports.getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contact', 'firstName lastName email company phone')
      .populate('lead', 'firstName lastName email')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role');

    if (!deal) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        deal
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Create new deal
// @route   POST /api/deals
// @access  Private
exports.createDeal = async (req, res) => {
  try {
    // Add createdBy field
    req.body.createdBy = req.user.id;

    // If no assignedTo, assign to creator
    if (!req.body.assignedTo) {
      req.body.assignedTo = req.user.id;
    }

    const deal = await Deal.create(req.body);

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'CREATE',
      module: 'Deal',
      recordId: deal._id,
      recordTitle: deal.title
    }, req);

    res.status(201).json({
      status: 'success',
      data: {
        deal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private
exports.updateDeal = async (req, res) => {
  try {
    let deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found'
      });
    }

    // Store old values for activity log
    const oldValues = { ...deal.toObject() };

    deal = await Deal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'UPDATE',
      module: 'Deal',
      recordId: deal._id,
      recordTitle: deal.title,
      changes: {
        before: oldValues,
        after: deal.toObject()
      }
    }, req);

    res.status(200).json({
      status: 'success',
      data: {
        deal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private
exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found'
      });
    }

    const dealTitle = deal.title;

    await deal.deleteOne();

    // Log activity
    await logActivity({
      user: req.user.id,
      action: 'DELETE',
      module: 'Deal',
      recordId: req.params.id,
      recordTitle: dealTitle
    }, req);

    res.status(200).json({
      status: 'success',
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
