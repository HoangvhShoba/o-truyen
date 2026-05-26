const express = require('express');
const chapterController = require('../controllers/chapter.controller');
const { authenticate } = require('../../../middlewares/auth');
const { optionalAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/history', authenticate, chapterController.getChapterHistory);

router.get('/:slug/:number', optionalAuth, chapterController.getChapterContent);

router.get('/:slug/:number/prev', chapterController.getPreviousChapter);

router.get('/:slug/:number/next', chapterController.getNextChapter);

router.post('/:id/mark-read', authenticate, chapterController.markChapterRead);

module.exports = router;
