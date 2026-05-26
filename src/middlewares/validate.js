const Joi = require('joi');
const ApiError = require('../common/ApiError');
const { HTTP_STATUS } = require('../common/constants');

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessage));
    }

    req.body = value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessage));
    }

    req.query = value;
    next();
  };
};

const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      return next(new ApiError(HTTP_STATUS.BAD_REQUEST, errorMessage));
    }

    req.params = value;
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
};
