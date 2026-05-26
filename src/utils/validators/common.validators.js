const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const objectId = Joi.string().pattern(objectIdPattern).message('Invalid ID format');

const email = Joi.string()
  .email()
  .lowercase()
  .trim()
  .min(5)
  .max(255)
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.min': 'Email must be at least 5 characters',
    'string.max': 'Email cannot exceed 255 characters',
    'any.required': 'Email is required',
  });

const password = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least 1 lowercase, 1 uppercase, and 1 number',
    'any.required': 'Password is required',
  });

const username = Joi.string()
  .min(3)
  .max(30)
  .trim()
  .pattern(/^[a-zA-Z0-9_]+$/)
  .required()
  .messages({
    'string.min': 'Username must be at least 3 characters',
    'string.max': 'Username cannot exceed 30 characters',
    'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
    'any.required': 'Username is required',
  });

const displayName = Joi.string().min(1).max(100).trim().required();

const url = Joi.string().uri().max(2048);

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const slugSchema = Joi.string().min(1).max(200).trim().lowercase().required();

const idParamSchema = Joi.object({
  id: objectId.required(),
});

const slugParamSchema = Joi.object({
  slug: slugSchema,
});

module.exports = {
  objectId,
  email,
  password,
  username,
  displayName,
  url,
  paginationSchema,
  slugSchema,
  idParamSchema,
  slugParamSchema,
};
