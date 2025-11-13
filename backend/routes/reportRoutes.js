const express = require('express');
const {
  getDealsReport,
  getDashboardStats
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/deals', getDealsReport);
router.get('/dashboard', getDashboardStats);

module.exports = router;
