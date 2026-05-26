const Rating = require('../models/Rating');
const Story = require('../../story/models/Story');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class RatingController {
  async rateStory(req, res, next) {
    try {
      const { slug } = req.params;
      const { rating } = req.body;

      const story = await Story.findOne({ slug, isHidden: false });
      if (!story) {
        throw ApiError.notFound('Story not found');
      }

      const existingRating = await Rating.findByUserAndStory(req.user._id, story._id);
      if (existingRating) {
        throw ApiError.conflict('You have already rated this story');
      }

      const newRating = await Rating.create({
        story: story._id,
        user: req.user._id,
        rating,
      });

      await Rating.updateStoryRating(story._id);

      const summary = await Rating.getStoryRatingSummary(story._id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        statusCode: HTTP_STATUS.CREATED,
        data: { userRating: newRating, summary },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRating(req, res, next) {
    try {
      const { slug } = req.params;
      const { rating } = req.body;

      const story = await Story.findOne({ slug, isHidden: false });
      if (!story) {
        throw ApiError.notFound('Story not found');
      }

      const existingRating = await Rating.findOneAndUpdate(
        { story: story._id, user: req.user._id, isDeleted: false },
        { rating },
        { new: true }
      );

      if (!existingRating) {
        throw ApiError.notFound('Rating not found');
      }

      await Rating.updateStoryRating(story._id);
      const summary = await Rating.getStoryRatingSummary(story._id);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: { userRating: existingRating, summary },
      });
    } catch (error) {
      next(error);
    }
  }

  async getRatingSummary(req, res, next) {
    try {
      const { slug } = req.params;

      const story = await Story.findOne({ slug, isHidden: false });
      if (!story) {
        throw ApiError.notFound('Story not found');
      }

      const summary = await Rating.getStoryRatingSummary(story._id);

      let userRating = null;
      if (req.user) {
        userRating = await Rating.findByUserAndStory(req.user._id, story._id);
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: { summary, userRating },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RatingController();
