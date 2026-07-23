const { ApiError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  let { statusCode, message, type } = err;

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = 'Internal Server Error';
    type = 'INTERNAL_ERROR';
  }

  const response = {
    error: message,
    status: statusCode,
    type: type
  };

  res.status(statusCode).json(response);
}

module.exports = { errorHandler };
