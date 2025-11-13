const ActivityLog = require('../models/ActivityLog');

/**
 * Log activity to database
 * @param {Object} data - Activity log data
 * @param {ObjectId} data.user - User ID
 * @param {String} data.action - Action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
 * @param {String} data.module - Module name (Lead, Contact, Deal, User, Auth)
 * @param {ObjectId} data.recordId - Record ID (optional)
 * @param {String} data.recordTitle - Record title (optional)
 * @param {Object} data.changes - Changes made (optional)
 * @param {Object} req - Express request object (optional)
 */
exports.logActivity = async (data, req = null) => {
  try {
    const logData = {
      user: data.user,
      action: data.action,
      module: data.module,
      recordId: data.recordId,
      recordTitle: data.recordTitle,
      changes: data.changes
    };

    // Add IP and User Agent if request object is provided
    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(logData);
  } catch (error) {
    // Log error but don't throw to prevent breaking main operation
    console.error('Activity logging error:', error.message);
  }
};

/**
 * Get activity logs with filters
 * @param {Object} filters - Filter options
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 */
exports.getActivityLogs = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;

    const query = ActivityLog.find(filters)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const logs = await query;
    const total = await ActivityLog.countDocuments(filters);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error('Error fetching activity logs: ' + error.message);
  }
};
