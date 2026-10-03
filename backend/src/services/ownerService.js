'use strict';
const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');
const { parsePagination } = require('../utils/queryHelpers');

/**
 * Get the store owner's dashboard data in one query sweep.
 * Returns store info + avg rating + paginated raters list.
 */
const getDashboard = async (ownerId, query) => {
  // Find the store belonging to this owner
  const store = await storeModel.findByOwnerId(ownerId);
  if (!store) {
    const err = new Error('No store found for this owner');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const { page, limit, offset } = parsePagination(query);
  const { sortBy = 'r.updated_at', order = 'DESC' } = query;

  // Parallel: get avg rating and list of raters
  const [avgData, raters] = await Promise.all([
    ratingModel.getAverageForStore(store.id),
    ratingModel.getStoreRatings(store.id, { sortBy, order, limit, offset }),
  ]);

  return {
    store: {
      ...store,
      avg_rating: avgData.avg_rating,
      total_ratings: parseInt(avgData.total_ratings),
    },
    raters,
    page,
    limit,
  };
};

module.exports = { getDashboard };
