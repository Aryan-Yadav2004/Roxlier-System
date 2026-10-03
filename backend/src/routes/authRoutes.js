'use strict';
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/validators');

// POST /api/auth/register
router.post('/register', registerValidator, validate, authController.register);

// POST /api/auth/login
router.post('/login', loginValidator, validate, authController.login);

// POST /api/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, authController.getMe);

// PATCH /api/auth/change-password  (protected)
router.patch(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);

module.exports = router;
