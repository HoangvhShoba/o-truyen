const Notification = require('../models/Notification');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const notifications = await Notification.findByUser(req.user._id, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      const unreadCount = await Notification.getUnreadCount(req.user._id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        throw ApiError.notFound('Notification not found');
      }

      if (notification.user.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Access denied');
      }

      await notification.markAsRead();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await Notification.markAllAsRead(req.user._id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification) {
        throw ApiError.notFound('Notification not found');
      }

      if (notification.user.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('Access denied');
      }

      await notification.delete();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Notification deleted',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
