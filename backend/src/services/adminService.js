'use strict';
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const storeModel = require('../models/storeModel');
const ratingModel = require('../models/ratingModel');
const { hashPassword } = require('../utils/hash');
const { parsePagination } = require('../utils/queryHelpers');

// ─────────────────────────────────────────────
// ADMIN SERVICE
// ─────────────────────────────────────────────

/**
 * Dashboard stats — fetches counts in parallel using Promise.all
 */
const getDashboardStats = async () => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    userModel.count(),
    storeModel.count(),
    ratingModel.count(),
  ]);
  return { totalUsers, totalStores, totalRatings };
};

/**
 * Admin creates a new user (any role).
 */
const createUser = async ({ name, email, address, password, role }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }
  const hashed = await hashPassword(password);
  return userModel.create({ id: uuidv4(), name, email, address, password: hashed, role });
};

/**
 * Admin creates a new store and links to an owner (must be a store_owner role user).
 */
const createStore = async ({ name, email, address, owner_id }) => {
  // Validate owner exists and is a store_owner
  const owner = await userModel.findById(owner_id);
  if (!owner || owner.role !== 'store_owner') {
    const err = new Error('Owner must be an existing user with the store_owner role');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }
  return storeModel.create({ id: uuidv4(), name, email, address, owner_id });
};

/**
 * List users with filters, sorting, and pagination.
 */
const listUsers = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const { search = '', role = '', sortBy = 'u.created_at', order = 'DESC' } = query;
  return userModel.list({ search, role, sortBy, order, limit, offset });
};

/**
 * List stores with sorting and pagination.
 */
const listStores = async (query) => {
  const { page, limit, offset } = parsePagination(query);
  const { search = '', sortBy = 's.name', order = 'ASC' } = query;
  return storeModel.list({ search, sortBy, order, limit, offset });
};

/**
 * Get detail of a single user.
 */
const getUserDetail = async (id) => {
  const user = await userModel.getDetailById(id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }
  return user;
};

module.exports = {
  getDashboardStats,
  createUser,
  createStore,
  listUsers,
  listStores,
  getUserDetail,
};
