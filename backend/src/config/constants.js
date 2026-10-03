'use strict';

module.exports = {
  // User roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    STORE_OWNER: 'store_owner',
  },

  // Rating limits
  RATING: {
    MIN: 1,
    MAX: 5,
  },

  // Validation limits
  VALIDATION: {
    NAME_MIN: 20,
    NAME_MAX: 60,
    ADDRESS_MAX: 400,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 16,
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
