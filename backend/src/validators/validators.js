'use strict';
const { body, query, param } = require('express-validator');
const { VALIDATION } = require('../config/constants');

// Password regex: 8-16 chars, at least one uppercase and one special character
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

// ─────────────────────────────────────────────
// AUTH VALIDATORS
// ─────────────────────────────────────────────
const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN, max: VALIDATION.NAME_MAX })
    .withMessage(`Name must be between ${VALIDATION.NAME_MIN} and ${VALIDATION.NAME_MAX} characters`),

  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),

  body('address')
    .trim()
    .isLength({ max: VALIDATION.ADDRESS_MAX })
    .withMessage(`Address must not exceed ${VALIDATION.ADDRESS_MAX} characters`),

  body('password')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must be 8–16 characters and include at least one uppercase letter and one special character'
    ),
];

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'New password must be 8–16 characters and include at least one uppercase letter and one special character'
    ),
];

// ─────────────────────────────────────────────
// USER / STORE VALIDATORS
// ─────────────────────────────────────────────
const createUserValidator = [
  body('name')
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN, max: VALIDATION.NAME_MAX })
    .withMessage(`Name must be between ${VALIDATION.NAME_MIN} and ${VALIDATION.NAME_MAX} characters`),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('address')
    .trim()
    .isLength({ max: VALIDATION.ADDRESS_MAX })
    .withMessage(`Address must not exceed ${VALIDATION.ADDRESS_MAX} characters`),
  body('password')
    .matches(PASSWORD_REGEX)
    .withMessage(
      'Password must be 8–16 characters and include at least one uppercase letter and one special character'
    ),
  body('role')
    .isIn(['admin', 'user', 'store_owner'])
    .withMessage('Role must be admin, user, or store_owner'),
];

const createStoreValidator = [
  body('name')
    .trim()
    .isLength({ min: VALIDATION.NAME_MIN, max: VALIDATION.NAME_MAX })
    .withMessage(`Store name must be between ${VALIDATION.NAME_MIN} and ${VALIDATION.NAME_MAX} characters`),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('address')
    .trim()
    .isLength({ max: VALIDATION.ADDRESS_MAX })
    .withMessage(`Address must not exceed ${VALIDATION.ADDRESS_MAX} characters`),
  body('owner_id').isUUID().withMessage('Valid owner_id (UUID) is required'),
];

const ratingValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
];

const uuidParamValidator = [
  param('id').isUUID().withMessage('Invalid ID format'),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
  createUserValidator,
  createStoreValidator,
  ratingValidator,
  uuidParamValidator,
};
