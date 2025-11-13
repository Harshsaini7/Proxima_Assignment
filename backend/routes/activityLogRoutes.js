const express = require('express');
const {
  getActivityLogs,
  getRecordActivityLogs,
  getUserActivityLogs
} = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getActivityLogs);
router.get('/record/:module/:recordId', getRecordActivityLogs);
router.get('/user/:userId', getUserActivityLogs);

module.exports = router;
