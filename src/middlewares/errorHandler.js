const ApiError = require('../common/ApiError');
const { HTTP_STATUS } = require('../common/constants');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, req, res);
  }
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
      error: err,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
      });
    } else {
      logger.error('ERROR 💥', err);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        status: 'error',
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong!',
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
        error: {},
      });
    } else {
      logger.error('ERROR 💥', err);
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
        error: {},
      });
    }
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg?.match(/(["'])(?:(?=(\\?))\2.)*?\1/)?.[0] || '';
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new ApiError(409, message);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(422, message);
};

const handleJWTError = () => {
  return new ApiError(401, 'Invalid token. Please log in again!');
};

const handleJWTExpiredError = () => {
  return new ApiError(401, 'Your token has expired! Please log in again.');
};

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Cannot find ${req.originalUrl} on this server`
  );
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
