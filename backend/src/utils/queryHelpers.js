'use strict';
const { PAGINATION } = require('../config/constants');

/**
 * Parse and clamp pagination parameters from query string.
 * @param {Object} query - req.query
 * @returns {{ page: number, limit: number, offset: number }}
 */
const parsePagination = (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Build an ORDER BY clause from query parameters.
 * @param {Object} query - req.query
 * @param {string[]} allowedFields - Whitelist of sortable column names
 * @param {string} defaultField
 * @returns {string}
 */
const buildOrderBy = (query = {}, allowedFields = [], defaultField = 'created_at') => {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const order = query.order === 'asc' ? 'ASC' : 'DESC';
  return `ORDER BY ${sortBy} ${order}`;
};

module.exports = { parsePagination, buildOrderBy };
