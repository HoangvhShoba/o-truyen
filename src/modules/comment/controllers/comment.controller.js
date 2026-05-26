const Comment = require('../models/Comment');
const Story = require('../../story/models/Story');
const User = require('../../user/Models/User');
const Report = require('../../report/models/Report');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS, COMMENT_STATUS, REPORT_TYPES } = require('../../../common/constants');

class CommentController {
  async getCommentsByStory(req, res, next) {
    try {
      const { storySlug } = req.params;
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const story = await Story.findOne({ slug: storySlug });
      if (!story) {
        throw ApiError.notFound('Story not found');
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [comments, total] = await Promise.all([
        Comment.find({ story: story._id, parent: null, isDeleted: false, status: COMMENT_STATUS.VISIBLE })
          .populate('user', 'username displayName avatar role')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit, 10)),
        Comment.countDocuments({ story: story._id, parent: null, isDeleted: false }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: comments,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, totalPages: Math.ceil(total / parseInt(limit, 10)) },
      });
    } catch (error) {
      next(error);
    }
  }

  async createComment(req, res, next) {
    try {
      const { storySlug } = req.params;
      const { content, parentId } = req.body;

      const story = await Story.findOne({ slug: storySlug });
      if (!story) {
        throw ApiError.notFound('Story not found');
      }

      const comment = await Comment.create({
        story: story._id,
        user: req.user._id,
        content,
        parent: parentId || null,
      });

      await Story.findByIdAndUpdate(story._id, { $inc: { totalComments: 1 } });

      const populatedComment = await Comment.findById(comment._id).populate('user', 'username displayName avatar role');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        data: populatedComment,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req, res, next) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      if (comment.user.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You can only edit your own comments');
      }

      comment.content = req.body.content;
      comment.isEdited = true;
      comment.editedAt = new Date();
      await comment.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw ApiError.forbidden('You can only delete your own comments');
      }

      await comment.softDelete();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async replyComment(req, res, next) {
    try {
      const { content } = req.body;
      const parentComment = await Comment.findById(req.params.id);
      if (!parentComment) {
        throw ApiError.notFound('Comment not found');
      }

      const reply = await Comment.create({
        story: parentComment.story,
        user: req.user._id,
        content,
        parent: parentComment._id,
        replyTo: parentComment.user,
      });

      await parentComment.incrementReplies();

      const populatedReply = await Comment.findById(reply._id).populate('user', 'username displayName avatar role');

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        data: populatedReply,
      });
    } catch (error) {
      next(error);
    }
  }

  async likeComment(req, res, next) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      await comment.incrementLikes();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: { likeCount: comment.likeCount + 1 },
      });
    } catch (error) {
      next(error);
    }
  }

  async reportComment(req, res, next) {
    try {
      const { reason, description } = req.body;
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        throw ApiError.notFound('Comment not found');
      }

      const existingReport = await Report.hasUserReported(req.user._id, 'comment', comment._id);
      if (existingReport) {
        throw ApiError.conflict('You have already reported this comment');
      }

      await Report.create({
        reporter: req.user._id,
        type: reason || REPORT_TYPES.OTHER,
        targetType: 'comment',
        targetId: comment._id,
        reason: description || reason,
      });

      await comment.updateOne({ $inc: { reportCount: 1 } });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        message: 'Comment reported successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommentController();
