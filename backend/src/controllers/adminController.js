'use strict';
const adminService = require('../services/adminService');
const { sendSuccess } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    return sendSuccess(res, stats, 'Dashboard data fetched');
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;
    const user = await adminService.createUser({ name, email, address, password, role });
    return sendSuccess(res, user, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const store = await adminService.createStore({ name, email, address, owner_id });
    return sendSuccess(res, store, 'Store created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const result = await adminService.listUsers(req.query);
    return sendSuccess(res, result, 'Users fetched');
  } catch (err) {
    next(err);
  }
};

const listStores = async (req, res, next) => {
  try {
    const result = await adminService.listStores(req.query);
    return sendSuccess(res, result, 'Stores fetched');
  } catch (err) {
    next(err);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const user = await adminService.getUserDetail(req.params.id);
    return sendSuccess(res, user, 'User detail fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, createUser, createStore, listUsers, listStores, getUserDetail };
