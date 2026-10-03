'use strict';
const ownerService = require('../services/ownerService');
const { sendSuccess } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const result = await ownerService.getDashboard(req.user.userId, req.query);
    return sendSuccess(res, result, 'Owner dashboard fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
