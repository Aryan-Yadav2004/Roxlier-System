'use strict';
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createUserValidator,
  createStoreValidator,
  uuidParamValidator,
} = require('../validators/validators');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/dashboard
router.get('/dashboard', adminController.getDashboard);

// POST /api/admin/users
router.post('/users', createUserValidator, validate, adminController.createUser);

// GET /api/admin/users
router.get('/users', adminController.listUsers);

// GET /api/admin/users/:id
router.get('/users/:id', uuidParamValidator, validate, adminController.getUserDetail);

// POST /api/admin/stores
router.post('/stores', createStoreValidator, validate, adminController.createStore);

// GET /api/admin/stores
router.get('/stores', adminController.listStores);

module.exports = router;
