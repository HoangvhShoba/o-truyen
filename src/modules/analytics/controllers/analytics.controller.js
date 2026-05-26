const Story = require('../../story/models/Story');
const { HTTP_STATUS } = require('../../../common/constants');

class AnalyticsController {
  async trackView(req, res, next) {
    try {
      const { slug } = req.body;
      await Story.findOneAndUpdate({ slug }, { $inc: { totalViews: 1 } });
      res.status(HTTP_STATUS.OK).json({ success: true, statusCode: HTTP_STATUS.OK });
    } catch (error) {
      next(error);
    }
  }

  async getStoryStats(req, res, next) {
    try {
      const story = await Story.findOne({ slug: req.params.slug });
      if (!story) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          statusCode: HTTP_STATUS.NOT_FOUND,
          message: 'Story not found',
        });
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: {
          totalViews: story.totalViews,
          monthlyViews: story.monthlyViews,
          weeklyViews: story.weeklyViews,
          dailyViews: story.dailyViews,
          rating: story.rating,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const popular = await Story.find({ isHidden: false })
        .sort({ totalViews: -1 })
        .limit(parseInt(limit, 10))
        .select('title slug coverImage totalViews');

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: popular,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDailyStats(req, res, next) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        date: today.toISOString().split('T')[0],
        totalStories: await Story.countDocuments(),
        totalViews: await Story.aggregate([
          { $group: { _id: null, total: { $sum: '$totalViews' } } },
        ]),
      };

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
