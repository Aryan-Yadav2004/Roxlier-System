'use strict';
const { sendError } = require('../utils/response');

/**
 * Global error handler. Must be registered LAST in express middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error('[Error]', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Postgres unique violation
  if (err.code === '23505') {
    return sendError(res, 'A record with this value already exists', 409);
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return sendError(res, 'Referenced resource does not exist', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';
  return sendError(res, message, statusCode);
};

/**
 * 404 handler for unmatched routes.
 */
const notFound = (req, res) => {
  return sendError(res, `Route ${req.method} ${req.path} not found`, 404);
};

module.exports = { errorHandler, notFound };
