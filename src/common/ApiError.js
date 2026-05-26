class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);

    if (stack) {
      this.stack = stack;
    }
  }

  static badRequest(message, details = null) {
    return new ApiError(400, message, true);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, true);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, true);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message, true);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message, true);
  }

  static unprocessableEntity(message = 'Unprocessable Entity') {
    return new ApiError(422, message, true);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new ApiError(429, message, true);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, false);
  }

  static serviceUnavailable(message = 'Service unavailable') {
    return new ApiError(503, message, true);
  }

  toJSON() {
    return {
      success: false,
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}

module.exports = ApiError;
