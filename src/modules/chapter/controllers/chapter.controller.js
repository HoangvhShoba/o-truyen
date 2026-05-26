const chapterService = require('../services/chapter.service');
const { HTTP_STATUS } = require('../../../common/constants');

class ChapterController {
  async getChapterContent(req, res, next) {
    try {
      const { slug, number } = req.params;
      const userId = req.user?._id;

      const result = await chapterService.getChapterContent(slug, number, userId);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.chapter,
        story: result.story,
        prevChapter: result.prevChapter,
        nextChapter: result.nextChapter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPreviousChapter(req, res, next) {
    try {
      const { slug, number } = req.params;

      const result = await chapterService.getPreviousChapter(slug, number);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.chapter,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNextChapter(req, res, next) {
    try {
      const { slug, number } = req.params;

      const result = await chapterService.getNextChapter(slug, number);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.chapter,
      });
    } catch (error) {
      next(error);
    }
  }

  async markChapterRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const result = await chapterService.markChapterRead(userId, id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChapterHistory(req, res, next) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const history = await chapterService.getChapterHistory(userId, {
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
}

module.exports = new ChapterController();
