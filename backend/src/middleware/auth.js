'use strict';
const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');

/**
 * Middleware: Authenticate request using Bearer access token.
 * Attaches decoded payload to req.user = { userId, role }.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Access token required', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Access token expired', 401);
    }
    return sendError(res, 'Invalid access token', 401);
  }
};

/**
 * Middleware factory: Authorize by allowed roles.
 * @param {...string} roles - Allowed role strings
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden: insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
