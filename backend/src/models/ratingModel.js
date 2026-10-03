'use strict';
const db = require('../config/db');

/**
 * Upsert a rating (insert or update if same user+store).
 * Uses PostgreSQL ON CONFLICT for atomic upsert.
 */
const upsert = async ({ id, user_id, store_id, rating }) => {
  const { rows } = await db.query(
    `INSERT INTO ratings (id, user_id, store_id, rating)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = NOW()
     RETURNING id, user_id, store_id, rating, updated_at`,
    [id, user_id, store_id, rating]
  );
  return rows[0];
};

/**
 * Find a user's rating for a specific store.
 */
const findUserRating = async (user_id, store_id) => {
  const { rows } = await db.query(
    `SELECT id, rating, updated_at FROM ratings WHERE user_id = $1 AND store_id = $2`,
    [user_id, store_id]
  );
  return rows[0] || null;
};

/**
 * Get all ratings for a store, with rater user details (JOIN).
 * Used by store owner dashboard.
 */
const getStoreRatings = async (store_id, { sortBy = 'r.updated_at', order = 'DESC', limit = 10, offset = 0 } = {}) => {
  const allowedSort = ['r.rating', 'r.updated_at', 'u.name'];
  const safeSort = allowedSort.includes(sortBy) ? sortBy : 'r.updated_at';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const { rows } = await db.query(
    `SELECT
       r.id,
       r.rating,
       r.updated_at,
       u.id    AS user_id,
       u.name  AS user_name,
       u.email AS user_email
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     WHERE r.store_id = $1
     ORDER BY ${safeSort} ${safeOrder}
     LIMIT $2 OFFSET $3`,
    [store_id, limit, offset]
  );
  return rows;
};

/**
 * Count total ratings in the system.
 */
const count = async () => {
  const { rows } = await db.query('SELECT COUNT(*) AS total FROM ratings');
  return parseInt(rows[0].total);
};

/**
 * Get average rating for a store.
 */
const getAverageForStore = async (store_id) => {
  const { rows } = await db.query(
    `SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS total_ratings
     FROM ratings WHERE store_id = $1`,
    [store_id]
  );
  return rows[0];
};

module.exports = { upsert, findUserRating, getStoreRatings, count, getAverageForStore };
