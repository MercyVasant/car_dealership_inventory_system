const { ApiError } = require('../utils/errors');
const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  let { statusCode, message, type } = err;

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = 'Internal Server Error';
    type = 'INTERNAL_ERROR';
    // Log unexpected errors with stack trace
    logger.error(`${err.message} - ${req.method} ${req.originalUrl}`, { stack: err.stack });
  } else {
    // Log API errors as warnings or info (optional)
    logger.warn(`${message} [${type}] - ${req.method} ${req.originalUrl}`);
  }

  const response = {
    error: message,
    status: statusCode,
    type: type
  };

  res.status(statusCode).json(response);
}

module.exports = { errorHandler };
