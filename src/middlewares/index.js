const {
  authenticate,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('./auth');

const { validate, validateQuery, validateParams } = require('./validate');
const { errorHandler, notFoundHandler } = require('./errorHandler');
const { globalLimiter, apiLimiter, authLimiter, uploadLimiter } = require('./rateLimiter');
const { upload, uploadSingle, uploadAvatar, uploadMultiple, handleUpload } = require('./upload');
const { requireRole, isAdmin, isModerator, isOwnerOrAdmin } = require('./roleGuard');
const { setSecurityHeaders, setCors, compressResponse } = require('./security');

module.exports = {
  authenticate,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  validate,
  validateQuery,
  validateParams,
  errorHandler,
  notFoundHandler,
  globalLimiter,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  upload,
  uploadSingle,
  uploadAvatar,
  uploadMultiple,
  handleUpload,
  requireRole,
  isAdmin,
  isModerator,
  isOwnerOrAdmin,
  setSecurityHeaders,
  setCors,
  compressResponse,
};
