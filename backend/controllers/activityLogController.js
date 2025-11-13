const { getActivityLogs } = require('../utils/activityLogger');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all activity logs
// @route   GET /api/activity-logs
// @access  Private
exports.getActivityLogs = async (req, res) => {
  try {
    const { module, action, user, page = 1, limit = 50 } = req.query;

    // Build filters
    const filters = {};

    if (module) {
      filters.module = module;
    }

    if (action) {
      filters.action = action;
    }

    if (user) {
      filters.user = user;
    }

    const result = await getActivityLogs(filters, parseInt(page), parseInt(limit));

    res.status(200).json({
      status: 'success',
      count: result.logs.length,
      pagination: result.pagination,
      data: {
        activityLogs: result.logs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get activity logs for a specific record
// @route   GET /api/activity-logs/record/:module/:recordId
// @access  Private
exports.getRecordActivityLogs = async (req, res) => {
  try {
    const { module, recordId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const filters = {
      module,
      recordId
    };

    const result = await getActivityLogs(filters, parseInt(page), parseInt(limit));

    res.status(200).json({
      status: 'success',
      count: result.logs.length,
      pagination: result.pagination,
      data: {
        activityLogs: result.logs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get user's activity logs
// @route   GET /api/activity-logs/user/:userId
// @access  Private
exports.getUserActivityLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const filters = {
      user: userId
    };

    const result = await getActivityLogs(filters, parseInt(page), parseInt(limit));

    res.status(200).json({
      status: 'success',
      count: result.logs.length,
      pagination: result.pagination,
      data: {
        activityLogs: result.logs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
