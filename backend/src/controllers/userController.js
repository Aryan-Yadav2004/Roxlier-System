'use strict';
const userService = require('../services/userService');
const { sendSuccess } = require('../utils/response');

const listStores = async (req, res, next) => {
  try {
    const result = await userService.listStores(req.query, req.user.userId);
    return sendSuccess(res, result, 'Stores fetched');
  } catch (err) {
    next(err);
  }
};

const submitRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const { storeId } = req.params;
    const result = await userService.submitRating(req.user.userId, storeId, rating);
    return sendSuccess(res, result, 'Rating submitted');
  } catch (err) {
    next(err);
  }
};

module.exports = { listStores, submitRating };
