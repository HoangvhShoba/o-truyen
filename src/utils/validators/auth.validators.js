const Joi = require('joi');
const { email, password, username, displayName, paginationSchema, slugSchema } = require('./common.validators');

const registerSchema = Joi.object({
  email: email.messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  username: username.messages({
    'any.required': 'Username is required',
  }),
  password: password.messages({
    'any.required': 'Password is required',
  }),
  displayName: displayName.messages({
    'any.required': 'Display name is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: password,
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: password,
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
});

const updateProfileSchema = Joi.object({
  displayName: displayName.optional(),
  bio: Joi.string().max(500).trim().optional(),
  dateOfBirth: Joi.date().iso().max('now').optional(),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').optional(),
  website: Joi.string().uri().max(2048).optional().allow(''),
  socialLinks: Joi.object({
    facebook: Joi.string().uri().max(2048).optional(),
    twitter: Joi.string().uri().max(2048).optional(),
    instagram: Joi.string().uri().max(2048).optional(),
  }).optional(),
});

const notificationSettingsSchema = Joi.object({
  emailNotifications: Joi.boolean().default(true),
  pushNotifications: Joi.boolean().default(true),
  newChapterAlerts: Joi.boolean().default(true),
  followStoryAlerts: Joi.boolean().default(true),
  commentReplies: Joi.boolean().default(true),
  weeklyDigest: Joi.boolean().default(false),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  updateProfileSchema,
  notificationSettingsSchema,
};
