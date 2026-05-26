const Story = require('../models/Story');
const Chapter = require('../../chapter/models/Chapter');
const Category = require('../../category/models/Category');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');

class StoryService {
  async getStories(query = {}, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const filter = { isHidden: false };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.category) {
      filter.categories = query.category;
    }

    if (query.genre) {
      filter['genres.slug'] = query.genre;
    }

    if (query.type) {
      filter.type = query.type;
    }

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .populate('categories', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments(filter),
    ]);

    return {
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async getStoryBySlug(slug) {
    const story = await Story.findOne({ slug, isHidden: false })
      .populate('categories', 'name slug description')
      .lean();

    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    return story;
  }

  async getChaptersByStory(storySlug, options = {}) {
    const { page = 1, limit = 50, sortOrder = 'asc' } = options;

    const story = await Story.findOne({ slug: storySlug, isHidden: false });
    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    const skip = (page - 1) * limit;
    const sort = sortOrder === 'desc' ? { number: -1 } : { number: 1 };

    const [chapters, total] = await Promise.all([
      Chapter.find({ story: story._id, isPublished: true, isDraft: false })
        .select('title number slug publishedAt totalViews')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Chapter.countDocuments({ story: story._id, isPublished: true, isDraft: false }),
    ]);

    return {
      story,
      chapters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLatestStories(limit = 10, options = {}) {
    const { page = 1 } = options;
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      Story.find({ isHidden: false })
        .populate('categories', 'name slug')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments({ isHidden: false }),
    ]);

    return { stories, total };
  }

  async getTrendingStories(limit = 10) {
    const stories = await Story.find({ isHidden: false })
      .populate('categories', 'name slug')
      .sort({ monthlyViews: -1 })
      .limit(limit)
      .lean();

    return stories;
  }

  async getHotStories(limit = 10) {
    const stories = await Story.find({ isHidden: false })
      .populate('categories', 'name slug')
      .sort({ totalViews: -1 })
      .limit(limit)
      .lean();

    return stories;
  }

  async getCompletedStories(options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      Story.find({ isHidden: false, isCompleted: true })
        .populate('categories', 'name slug')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments({ isHidden: false, isCompleted: true }),
    ]);

    return { stories, total };
  }

  async getOngoingStories(options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [stories, total] = await Promise.all([
      Story.find({ isHidden: false, status: 'ongoing' })
        .populate('categories', 'name slug')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments({ isHidden: false, status: 'ongoing' }),
    ]);

    return { stories, total };
  }

  async getRecommendedStories(userId, limit = 10) {
    const stories = await Story.find({ isHidden: false })
      .populate('categories', 'name slug')
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(limit)
      .lean();

    return stories;
  }

  async getRelatedStories(storySlug, limit = 5) {
    const story = await Story.findOne({ slug: storySlug, isHidden: false });
    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    const categoryIds = story.categories;
    const genreSlugs = story.genres.map((g) => g.slug);

    const stories = await Story.find({
      _id: { $ne: story._id },
      isHidden: false,
      $or: [
        { categories: { $in: categoryIds } },
        { 'genres.slug': { $in: genreSlugs } },
      ],
    })
      .populate('categories', 'name slug')
      .sort({ totalViews: -1 })
      .limit(limit)
      .lean();

    return stories;
  }

  async searchStories(query, options = {}) {
    const { page = 1, limit = 20, type, status, category } = options;
    const skip = (page - 1) * limit;

    const filter = { isHidden: false };

    if (query) {
      filter.$text = { $search: query };
    }

    if (type) {
      filter.type = type;
    }

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categories = category;
    }

    const [stories, total] = await Promise.all([
      Story.find(filter)
        .populate('categories', 'name slug')
        .sort(query ? { score: { $meta: 'textScore' } } : { updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments(filter),
    ]);

    return {
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSearchSuggestions(keyword, limit = 5) {
    if (!keyword || keyword.length < 2) {
      return [];
    }

    const stories = await Story.find({
      isHidden: false,
      title: { $regex: keyword, $options: 'i' },
    })
      .select('title slug coverImage')
      .limit(limit)
      .lean();

    return stories;
  }

  async getRanking(type = 'day', limit = 10) {
    let sortField = 'dailyViews';
    if (type === 'week') sortField = 'weeklyViews';
    if (type === 'month') sortField = 'monthlyViews';

    const stories = await Story.find({ isHidden: false })
      .populate('categories', 'name slug')
      .sort({ [sortField]: -1 })
      .limit(limit)
      .lean();

    return stories;
  }

  async incrementView(slug) {
    const story = await Story.findOneAndUpdate(
      { slug, isHidden: false },
      { $inc: { totalViews: 1, dailyViews: 1, weeklyViews: 1, monthlyViews: 1 } },
      { new: true }
    );

    if (!story) {
      throw ApiError.notFound('Story not found');
    }

    return story;
  }

  async getFeaturedStories(limit = 10) {
    const stories = await Story.find({ isHidden: false, isFeatured: true })
      .populate('categories', 'name slug')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    return stories;
  }

  async getStoriesByCategory(categorySlug, options = {}) {
    const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = options;

    const category = await Category.findOne({ slug: categorySlug, isActive: true });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [stories, total] = await Promise.all([
      Story.find({ isHidden: false, categories: category._id })
        .populate('categories', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Story.countDocuments({ isHidden: false, categories: category._id }),
    ]);

    return {
      category,
      stories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new StoryService();
