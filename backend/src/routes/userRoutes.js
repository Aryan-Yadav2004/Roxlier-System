'use strict';
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ratingValidator } = require('../validators/validators');
const { param } = require('express-validator');

router.use(authenticate, authorize('user'));

// GET /api/user/stores
router.get('/stores', userController.listStores);

// POST /api/user/stores/:storeId/ratings
router.post(
  '/stores/:storeId/ratings',
  [param('storeId').isUUID().withMessage('Invalid store ID')],
  ratingValidator,
  validate,
  userController.submitRating
);

module.exports = router;
