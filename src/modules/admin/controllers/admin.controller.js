const User = require('../../user/models/User');
const Story = require('../../story/models/Story');
const Comment = require('../../comment/models/Comment');
const Report = require('../../report/models/Report');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS, USER_ROLES } = require('../../../common/constants');

class AdminController {
  async getDashboardStats(req, res, next) {
    try {
      const [totalUsers, totalStories, totalComments, pendingReports] = await Promise.all([
        User.countDocuments(),
        Story.countDocuments(),
        Comment.countDocuments({ isDeleted: false }),
        Report.countDocuments({ status: 'pending' }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: { totalUsers, totalStories, totalComments, pendingReports },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, role, status } = req.query;
      const filter = {};
      if (role) filter.role = role;
      if (status) filter.status = status;

      const [users, total] = await Promise.all([
        User.find(filter).skip((parseInt(page, 10) - 1) * parseInt(limit, 10)).limit(parseInt(limit, 10)),
        User.countDocuments(filter),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: users,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
      if (!user) throw ApiError.notFound('User not found');

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await User.findByIdAndUpdate(req.params.id, { isBanned: true, status: 'banned' });
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'User banned successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getStories(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const [stories, total] = await Promise.all([
        Story.find().skip((parseInt(page, 10) - 1) * parseInt(limit, 10)).limit(parseInt(limit, 10)),
        Story.countDocuments(),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteStory(req, res, next) {
    try {
      await Story.findByIdAndUpdate(req.params.id, { isHidden: true });
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Story hidden successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const [comments, total] = await Promise.all([
        Comment.find({ isDeleted: false }).populate('user', 'username displayName').skip((parseInt(page, 10) - 1) * parseInt(limit, 10)).limit(parseInt(limit, 10)),
        Comment.countDocuments({ isDeleted: false }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: comments,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req, res, next) {
    try {
      const comment = await Comment.findById(req.params.id);
      if (comment) await comment.softDelete();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const filter = status ? { status } : {};
      const [reports, total] = await Promise.all([
        Report.find(filter).populate('reporter', 'username displayName').skip((parseInt(page, 10) - 1) * parseInt(limit, 10)).limit(parseInt(limit, 10)),
        Report.countDocuments(filter),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: reports,
        pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total },
      });
    } catch (error) {
      next(error);
    }
  }

  async resolveReport(req, res, next) {
    try {
      const { resolution, actionTaken } = req.body;
      const report = await Report.findById(req.params.id);
      if (!report) throw ApiError.notFound('Report not found');

      await report.resolve(req.user._id, resolution, actionTaken);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Report resolved successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
