const Bookmark = require('../models/Bookmark');
const Story = require('../../story/models/Story');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class BookmarkController {
  async getBookmarks(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const bookmarks = await Bookmark.findByUser(req.user._id, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: bookmarks,
      });
    } catch (error) {
      next(error);
    }
  }

  async addBookmark(req, res, next) {
    try {
      const { storyId } = req.params;
      const { note } = req.body;

      const story = await Story.findOne({ _id: storyId, isHidden: false });
      if (!story) {
        throw ApiError.notFound('Story not found');
      }

      const existing = await Bookmark.findOne({ user: req.user._id, story: storyId });
      if (existing) {
        throw ApiError.conflict('Story already bookmarked');
      }

      const bookmark = await Bookmark.create({
        user: req.user._id,
        story: storyId,
        note,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeBookmark(req, res, next) {
    try {
      const { storyId } = req.params;
      const bookmark = await Bookmark.findOneAndDelete({ user: req.user._id, story: storyId });

      if (!bookmark) {
        throw ApiError.notFound('Bookmark not found');
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Bookmark removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookmarkController();
