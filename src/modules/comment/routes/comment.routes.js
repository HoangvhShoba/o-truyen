const express = require('express');
const commentController = require('../controllers/comment.controller');
const { authenticate, optionalAuth } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/story/:storySlug', commentController.getCommentsByStory);
router.post('/story/:storySlug', authenticate, commentController.createComment);
router.put('/:id', authenticate, commentController.updateComment);
router.delete('/:id', authenticate, commentController.deleteComment);
router.post('/:id/reply', authenticate, commentController.replyComment);
router.post('/:id/like', authenticate, commentController.likeComment);
router.post('/:id/report', authenticate, commentController.reportComment);

module.exports = router;
