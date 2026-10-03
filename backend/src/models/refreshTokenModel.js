'use strict';
const db = require('../config/db');

/**
 * Store a new refresh token.
 */
const create = async ({ id, user_id, token, expires_at }) => {
  await db.query(
    `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [id, user_id, token, expires_at]
  );
};

/**
 * Find a refresh token by its token string.
 */
const findByToken = async (token) => {
  const { rows } = await db.query(
    `SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW() LIMIT 1`,
    [token]
  );
  return rows[0] || null;
};

/**
 * Delete a specific refresh token (logout).
 */
const deleteByToken = async (token) => {
  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};

/**
 * Delete all refresh tokens for a user (force logout all devices).
 */
const deleteByUserId = async (user_id) => {
  await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [user_id]);
};

/**
 * Clean up expired tokens (can be called on a schedule).
 */
const deleteExpired = async () => {
  const { rowCount } = await db.query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
  return rowCount;
};

module.exports = { create, findByToken, deleteByToken, deleteByUserId, deleteExpired };
