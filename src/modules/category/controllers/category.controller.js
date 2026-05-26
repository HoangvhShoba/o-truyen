const Category = require('../models/Category');
const Story = require('../../story/models/Story');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class CategoryController {
  async getCategories(req, res, next) {
    try {
      const categories = await Category.getAllActive();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBySlug(req, res, next) {
    try {
      const category = await Category.findBySlug(req.params.slug);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }
      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async getStoriesByCategory(req, res, next) {
    try {
      const { slug } = req.params;
      const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;

      const category = await Category.findBySlug(slug);
      if (!category) {
        throw ApiError.notFound('Category not found');
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [stories, total] = await Promise.all([
        Story.find({ isHidden: false, categories: category._id })
          .populate('categories', 'name slug')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit, 10))
          .lean(),
        Story.countDocuments({ isHidden: false, categories: category._id }),
      ]);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        statusCode: HTTP_STATUS.OK,
        data: stories,
        category,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
