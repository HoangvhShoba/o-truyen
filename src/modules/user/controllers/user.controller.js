const User = require('../models/User');
const ReadingHistory = require('../../reading-history/models/ReadingHistory');
const Bookmark = require('../../bookmark/models/Bookmark');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class UserController {
  async getProfile(req, res, next) {
    try {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: req.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      const allowedFields = ['displayName', 'bio', 'dateOfBirth', 'gender', 'website', 'socialLinks'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      await user.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      await User.findByIdAndUpdate(req.user._id, { isBanned: true, status: 'inactive' });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getReadingHistory(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const history = await ReadingHistory.findByUser(req.user._id, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req, res, next) {
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

  async addFavorite(req, res, next) {
    try {
      const { storyId } = req.params;
      const user = await User.findById(req.user._id);
      await user.addFavorite(storyId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Story added to favorites',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const { storyId } = req.params;
      const user = await User.findById(req.user._id);
      await user.removeFavorite(storyId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Story removed from favorites',
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationSettings(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: user.notificationSettings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationSettings(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      Object.assign(user.notificationSettings, req.body);
      await user.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Notification settings updated',
        data: user.notificationSettings,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
