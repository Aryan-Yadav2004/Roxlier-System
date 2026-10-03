'use strict';
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware to check express-validator results.
 * Must be placed AFTER validator rule arrays in the route chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', 422, errors.array());
  }
  next();
};

module.exports = validate;
