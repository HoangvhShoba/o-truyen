const ApiError = require('../common/ApiError');
const { HTTP_STATUS } = require('../common/constants');
const { USER_ROLES } = require('../common/constants');

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access denied. Required role: ${allowedRoles.join(' or ')}`
        )
      );
    }

    next();
  };
};

const isAdmin = requireRole(USER_ROLES.ADMIN);

const isModerator = requireRole(USER_ROLES.ADMIN, USER_ROLES.MODERATOR);

const isOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
      }

      const ownerId = await getOwnerId(req);

      if (req.user.role === USER_ROLES.ADMIN || req.user._id.toString() === ownerId) {
        return next();
      }

      return next(
        new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission to perform this action')
      );
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  requireRole,
  isAdmin,
  isModerator,
  isOwnerOrAdmin,
};
