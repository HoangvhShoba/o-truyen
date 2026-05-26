const express = require('express');
const bookmarkController = require('../controllers/bookmark.controller');
const { authenticate } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, bookmarkController.getBookmarks);
router.post('/:storyId', authenticate, bookmarkController.addBookmark);
router.delete('/:storyId', authenticate, bookmarkController.removeBookmark);

module.exports = router;
