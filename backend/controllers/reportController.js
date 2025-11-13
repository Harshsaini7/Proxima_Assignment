const Deal = require('../models/Deal');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');

// @desc    Get deals report
// @route   GET /api/reports/deals
// @access  Private
exports.getDealsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Get deals by stage
    const dealsByStage = await Deal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Get won deals
    const wonDeals = await Deal.find({
      stage: 'Won',
      ...dateFilter
    }).populate('assignedTo', 'name email');

    // Get lost deals
    const lostDeals = await Deal.find({
      stage: 'Lost',
      ...dateFilter
    }).populate('assignedTo', 'name email');

    // Calculate win rate
    const totalClosedDeals = wonDeals.length + lostDeals.length;
    const winRate = totalClosedDeals > 0
      ? ((wonDeals.length / totalClosedDeals) * 100).toFixed(2)
      : 0;

    // Get total revenue (won deals)
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0);

    // Get deals by assigned user
    const dealsByUser = await Deal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$assignedTo',
          totalDeals: { $sum: 1 },
          wonDeals: {
            $sum: { $cond: [{ $eq: ['$stage', 'Won'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$stage', 'Won'] }, '$amount', 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          userName: '$user.name',
          userEmail: '$user.email',
          totalDeals: 1,
          wonDeals: 1,
          totalRevenue: 1,
          winRate: {
            $cond: [
              { $eq: ['$totalDeals', 0] },
              0,
              { $multiply: [{ $divide: ['$wonDeals', '$totalDeals'] }, 100] }
            ]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalRevenue,
          wonDealsCount: wonDeals.length,
          lostDealsCount: lostDeals.length,
          winRate: parseFloat(winRate)
        },
        dealsByStage,
        dealsByUser,
        wonDeals,
        lostDeals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalLeads = await Lead.countDocuments();
    const totalContacts = await Contact.countDocuments();
    const totalDeals = await Deal.countDocuments();

    // Get deals by stage
    const newDeals = await Deal.countDocuments({ stage: 'New' });
    const inProgressDeals = await Deal.countDocuments({ stage: 'In Progress' });
    const wonDeals = await Deal.countDocuments({ stage: 'Won' });
    const lostDeals = await Deal.countDocuments({ stage: 'Lost' });

    // Get total revenue
    const wonDealsData = await Deal.find({ stage: 'Won' });
    const totalRevenue = wonDealsData.reduce((sum, deal) => sum + deal.amount, 0);

    // Get leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activities (last 10)
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name');

    const recentDeals = await Deal.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name')
      .populate('contact', 'firstName lastName');

    res.status(200).json({
      status: 'success',
      data: {
        overview: {
          totalLeads,
          totalContacts,
          totalDeals,
          totalRevenue
        },
        dealsByStage: {
          new: newDeals,
          inProgress: inProgressDeals,
          won: wonDeals,
          lost: lostDeals
        },
        leadsByStatus,
        recentActivities: {
          recentLeads,
          recentDeals
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
