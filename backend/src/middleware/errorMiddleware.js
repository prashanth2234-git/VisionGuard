const multer = require('multer');
const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} failed: ${err.message}`, {
    statusCode: err.statusCode || 500,
    code: err.code || 'INTERNAL_ERROR',
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'File size exceeds the allowed limit (max 25MB).', 400, 'FILE_TOO_LARGE');
    }
    return errorResponse(res, `Upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
  }

  // Handle AppError
  if (err.isOperational) {
    return errorResponse(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Invalid JSON payload received in request.', 400, 'MALFORMED_JSON');
  }

  // Generic fallback for unhandled exceptions
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected internal server error occurred. Please try again later.'
    : err.message || 'Internal Server Error';

  return errorResponse(res, message, 500, 'INTERNAL_SERVER_ERROR');
};

module.exports = errorHandler;
