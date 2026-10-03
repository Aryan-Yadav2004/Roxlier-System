'use strict';
const { v4: uuidv4 } = require('uuid');
const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');
const { parsePagination } = require('../utils/queryHelpers');

/**
 * List all stores for normal users, with per-user rating included.
 */
const listStores = async (query, userId) => {
  const { page, limit, offset } = parsePagination(query);
  const { search = '', sortBy = 's.name', order = 'ASC' } = query;
  return storeModel.list({ search, sortBy, order, limit, offset, userId });
};

/**
 * Submit or update a rating for a store.
 */
const submitRating = async (userId, storeId, rating) => {
  // Ensure store exists
  const store = await storeModel.findById(storeId);
  if (!store) {
    const err = new Error('Store not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  // Upsert rating (insert or update)
  const result = await ratingModel.upsert({
    id: uuidv4(),
    user_id: userId,
    store_id: storeId,
    rating,
  });

  return result;
};

module.exports = { listStores, submitRating };
