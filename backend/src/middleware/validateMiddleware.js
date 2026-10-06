const { errorResponse } = require('../utils/response');

const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation failed';
      return errorResponse(res, message, 400, 'VALIDATION_ERROR', result.error.format());
    }
    req.body = result.data;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Invalid query parameters';
      return errorResponse(res, message, 400, 'VALIDATION_ERROR', result.error.format());
    }
    req.query = result.data;
    next();
  };
};

module.exports = {
  validateBody,
  validateQuery,
};
