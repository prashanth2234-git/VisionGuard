const jwt = require('jsonwebtoken');
const config = require('../config');
const { errorResponse } = require('../utils/response');
const db = require('../db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required. No token provided.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Authentication token missing.', 401, 'UNAUTHORIZED');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session token has expired. Please sign in again.', 401, 'TOKEN_EXPIRED');
      }
      return errorResponse(res, 'Invalid authentication token.', 401, 'INVALID_TOKEN');
    }

    const result = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return errorResponse(res, 'User associated with this token no longer exists.', 401, 'USER_NOT_FOUND');
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return next(error);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 'Access denied. Insufficient permissions for this action.', 403, 'FORBIDDEN');
    }
    next();
  };
};

module.exports = {
  authenticate,
  requireRole,
};
