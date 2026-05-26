const express = require('express');
const storyController = require('../controllers/story.controller');
const { optionalAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/', storyController.getStories);

router.get('/latest', storyController.getLatestStories);

router.get('/trending', storyController.getTrendingStories);

router.get('/hot', storyController.getHotStories);

router.get('/completed', storyController.getCompletedStories);

router.get('/ongoing', storyController.getOngoingStories);

router.get('/featured', storyController.getFeaturedStories);

router.get('/recommend', optionalAuth, storyController.getRecommendedStories);

router.get('/ranking', storyController.getRanking);

router.get('/search', storyController.searchStories);

router.get('/suggest', storyController.getSearchSuggestions);

router.get('/category/:slug', storyController.getStoriesByCategory);

router.get('/:slug', storyController.getStoryBySlug);

router.get('/:slug/chapters', storyController.getChaptersByStory);

router.get('/:slug/related', storyController.getRelatedStories);

router.post('/:slug/view', storyController.incrementView);

module.exports = router;
