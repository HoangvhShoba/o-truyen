const Joi = require('joi');
const { slugSchema, paginationSchema } = require('./common.validators');
const { STORY_STATUS } = require('../../common/constants');

const getStoriesSchema = Joi.object({
  ...paginationSchema.keys(),
  status: Joi.string().valid(...Object.values(STORY_STATUS)).optional(),
  category: Joi.string().optional(),
  genre: Joi.string().optional(),
  author: Joi.string().optional(),
  year: Joi.number().integer().min(1900).max(2100).optional(),
  sortBy: Joi.string().valid('title', 'createdAt', 'updatedAt', 'viewCount', 'rating').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().max(200).optional(),
});

const getStoryBySlugSchema = Joi.object({
  slug: slugSchema,
});

const getChaptersSchema = Joi.object({
  ...paginationSchema.keys(),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
});

const searchStoriesSchema = Joi.object({
  q: Joi.string().min(1).max(200).required(),
  ...paginationSchema.keys(),
  type: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(STORY_STATUS)).optional(),
  category: Joi.string().optional(),
});

const rateStorySchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
});

const reportStorySchema = Joi.object({
  reason: Joi.string()
    .valid('spam', 'harassment', 'inappropriate', 'copyright', 'other')
    .required(),
  description: Joi.string().max(2000).trim().optional(),
});

const bookmarkStorySchema = Joi.object({
  note: Joi.string().max(500).trim().optional(),
});

module.exports = {
  getStoriesSchema,
  getStoryBySlugSchema,
  getChaptersSchema,
  searchStoriesSchema,
  rateStorySchema,
  reportStorySchema,
  bookmarkStorySchema,
};
