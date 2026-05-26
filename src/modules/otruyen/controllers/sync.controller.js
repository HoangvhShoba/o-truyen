const otruyenService = require('../services/otruyen.service');
const { HTTP_STATUS } = require('../../../common/constants');

class SyncController {
  async syncCategories(req, res, next) {
    try {
      const userId = req.user?._id;
      const result = await otruyenService.syncCategories('api', userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Categories synced successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async syncHomeData(req, res, next) {
    try {
      const userId = req.user?._id;
      const result = await otruyenService.syncHomeData('api', userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Home data synced successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async syncStory(req, res, next) {
    try {
      const { slug } = req.params;
      const userId = req.user?._id;
      const result = await otruyenService.syncStory(slug, 'api', userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: `Story "${slug}" synced successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async syncStories(req, res, next) {
    try {
      const { type = 'truyen-tranh', startPage = 1, endPage = 10 } = req.query;
      const userId = req.user?._id;

      const result = await otruyenService.syncStories(
        type,
        parseInt(startPage, 10),
        parseInt(endPage, 10),
        'api',
        userId
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Stories synced successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async syncAll(req, res, next) {
    try {
      const userId = req.user?._id;
      const result = await otruyenService.syncAll('api', userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: 'Full sync completed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSyncStatus(req, res, next) {
    try {
      const status = await otruyenService.getSyncStatus();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SyncController();
