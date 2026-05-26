const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../../../middlewares/auth');

const router = express.Router();

router.post('/track/view', analyticsController.trackView);
router.get('/stories/:slug/stats', analyticsController.getStoryStats);
router.get('/popular', analyticsController.getPopular);
router.get('/daily', authenticate, analyticsController.getDailyStats);

module.exports = router;
