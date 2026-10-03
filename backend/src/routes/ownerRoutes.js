'use strict';
const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('store_owner'));

// GET /api/owner/dashboard
router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
