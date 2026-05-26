const storyService = require('../services/story.service');
const { HTTP_STATUS } = require('../../../common/constants');
const { paginatedResponse } = require('../../../common/pagination');

class StoryController {
  async getStories(req, res, next) {
    try {
      const { page, limit, status, category, genre, sortBy, sortOrder } = req.query;

      const result = await storyService.getStories(req.query, {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
        sortBy: sortBy || 'createdAt',
        sortOrder: sortOrder || 'desc',
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.stories,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoryBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const story = await storyService.getStoryBySlug(slug);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: story,
      });
    } catch (error) {
      next(error);
    }
  }

  async getChaptersByStory(req, res, next) {
    try {
      const { slug } = req.params;
      const { page, limit, sortOrder } = req.query;

      const result = await storyService.getChaptersByStory(slug, {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50,
        sortOrder: sortOrder || 'asc',
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.chapters,
        story: result.story,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLatestStories(req, res, next) {
    try {
      const { limit = 10, page = 1 } = req.query;
      const result = await storyService.getLatestStories(parseInt(limit, 10), {
        page: parseInt(page, 10),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.stories,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingStories(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const stories = await storyService.getTrendingStories(parseInt(limit, 10));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHotStories(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const stories = await storyService.getHotStories(parseInt(limit, 10));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCompletedStories(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await storyService.getCompletedStories({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.stories,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOngoingStories(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const result = await storyService.getOngoingStories({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.stories,
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendedStories(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const userId = req.user?._id;
      const stories = await storyService.getRecommendedStories(userId, parseInt(limit, 10));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRelatedStories(req, res, next) {
    try {
      const { slug } = req.params;
      const { limit = 5 } = req.query;
      const stories = await storyService.getRelatedStories(slug, parseInt(limit, 10));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchStories(req, res, next) {
    try {
      const { q, type, status, category, page = 1, limit = 20 } = req.query;

      const result = await storyService.searchStories(q, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        type,
        status,
        category,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.stories,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSearchSuggestions(req, res, next) {
    try {
      const { q } = req.query;
      const suggestions = await storyService.getSearchSuggestions(q);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRanking(req, res, next) {
    try {
      const { type = 'day', limit = 10 } = req.query;
      const stories = await storyService.getRanking(type, parseInt(limit, 10));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async incrementView(req, res, next) {
    try {
      const { slug } = req.params;
      const story = await storyService.incrementView(slug);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: { views: story.totalViews },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedStories(req, res, next) {
    try {
      const { limit = 10 } = req.query;
      const stories = await storyService.getFeaturedStories(parseInt(limit, 10));

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoriesByCategory(req, res, next) {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 20, sortBy, sortOrder } = req.query;

      const result = await storyService.getStoriesByCategory(slug, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortBy: sortBy || 'updatedAt',
        sortOrder: sortOrder || 'desc',
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: result.stories,
        category: result.category,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StoryController();
