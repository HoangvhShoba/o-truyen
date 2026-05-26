const express = require('express');
const ratingController = require('../controllers/rating.controller');
const { authenticate } = require('../../../middlewares/auth');

const router = express.Router();

router.post('/stories/:slug', authenticate, ratingController.rateStory);
router.put('/stories/:slug', authenticate, ratingController.updateRating);
router.get('/stories/:slug', ratingController.getRatingSummary);

module.exports = router;
