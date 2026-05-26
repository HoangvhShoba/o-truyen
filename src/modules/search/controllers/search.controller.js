const Story = require('../../story/models/Story');
const { HTTP_STATUS } = require('../../../common/constants');

class SearchController {
  async search(req, res, next) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      if (!q || q.length < 2) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          statusCode: HTTP_STATUS.OK,
          data: [],
        });
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const [stories, total] = await Promise.all([
        Story.find({ isHidden: false, title: { $regex: q, $options: 'i' } })
          .populate('categories', 'name slug')
          .skip(skip)
          .limit(parseInt(limit, 10)),
        Story.countDocuments({ isHidden: false, title: { $regex: q, $options: 'i' } }),
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

  async getSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          statusCode: HTTP_STATUS.OK,
          data: [],
        });
      }

      const suggestions = await Story.find({ isHidden: false, title: { $regex: q, $options: 'i' } })
        .select('title slug coverImage')
        .limit(5);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingKeywords(req, res, next) {
    try {
      const trending = ['truyện tranh', 'truyện chữ', 'action', 'romance', 'comedy'];
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: trending,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
