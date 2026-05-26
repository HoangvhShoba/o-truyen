const Joi = require('joi');
const { slugSchema, paginationSchema, objectId } = require('./common.validators');

const getChapterSchema = Joi.object({
  slug: slugSchema,
  number: Joi.number().integer().min(1).required(),
});

const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).trim().required(),
  parentId: objectId.optional(),
});

const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(5000).trim().required(),
});

const reportCommentSchema = Joi.object({
  reason: Joi.string()
    .valid('spam', 'harassment', 'inappropriate', 'offensive', 'other')
    .required(),
  description: Joi.string().max(2000).trim().optional(),
});

const getCommentsSchema = Joi.object({
  ...paginationSchema.keys(),
  sortBy: Joi.string().valid('createdAt', 'likeCount').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  getChapterSchema,
  createCommentSchema,
  updateCommentSchema,
  reportCommentSchema,
  getCommentsSchema,
};
