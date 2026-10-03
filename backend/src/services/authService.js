'use strict';
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

/**
 * Calculate refresh token expiry date.
 * @returns {Date}
 */
const getRefreshExpiry = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7); // 7 days
  return d;
};

/**
 * Register a normal user (self-signup).
 */
const register = async ({ name, email, address, password }) => {
  const existing = await userModel.findByEmail(email);
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    err.isOperational = true;
    throw err;
  }

  const hashed = await hashPassword(password);
  const user = await userModel.create({
    id: uuidv4(),
    name,
    email,
    address,
    password: hashed,
    role: 'user',
  });

  return user;
};

/**
 * Login — returns accessToken + refreshToken.
 */
const login = async ({ email, password }) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  const payload = { userId: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  await refreshTokenModel.create({
    id: uuidv4(),
    user_id: user.id,
    token: refreshToken,
    expires_at: getRefreshExpiry(),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Refresh access token using a valid refresh token.
 */
const refreshAccessToken = async (refreshToken) => {
  // Verify signature
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  // Check token exists in DB (not revoked)
  const storedToken = await refreshTokenModel.findByToken(refreshToken);
  if (!storedToken) {
    const err = new Error('Refresh token revoked or expired');
    err.statusCode = 401;
    err.isOperational = true;
    throw err;
  }

  const user = await userModel.findById(decoded.userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  return { accessToken };
};

/**
 * Logout — invalidate the refresh token.
 */
const logout = async (refreshToken) => {
  await refreshTokenModel.deleteByToken(refreshToken);
};

/**
 * Change password for authenticated user.
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userModel.findByEmail(
    (await userModel.findById(userId))?.email
  );
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    err.isOperational = true;
    throw err;
  }

  const valid = await comparePassword(currentPassword, user.password);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 400;
    err.isOperational = true;
    throw err;
  }

  const hashed = await hashPassword(newPassword);
  await userModel.updatePassword(userId, hashed);

  // Invalidate all refresh tokens after password change
  await refreshTokenModel.deleteByUserId(userId);
};

module.exports = { register, login, refreshAccessToken, logout, changePassword };
