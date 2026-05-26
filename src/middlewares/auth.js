const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../common/ApiError');
const { HTTP_STATUS } = require('../common/constants');
const User = require('../modules/user/models/User');

const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'You are not logged in! Please log in to get access.'));
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'The user belonging to this token no longer exists.'));
    }

    if (user.isBanned) {
      return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'Your account has been banned.'));
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token. Please log in again.'));
    }
    next(error);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.id);
      if (user && !user.isBanned) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshSecret,
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

module.exports = {
  authenticate,
  optionalAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};
