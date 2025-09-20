const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getEmployeeAnalytics,
  getDepartmentPerformance,
  getFinancialReport
} = require('../controllers/reportController');
const reportOverviewController = require('../controllers/reportOverviewController');

// Apply protect middleware to all report routes
router.use(protect);

// Reports Overview Route
router.get('/', reportOverviewController.getReportsOverview);

// Individual Report Routes
router.get('/employee-analytics', getEmployeeAnalytics);
router.get('/department-performance', getDepartmentPerformance);
router.get('/financial', getFinancialReport);

module.exports = router;
