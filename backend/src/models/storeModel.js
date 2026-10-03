'use strict';
const db = require('../config/db');

/**
 * Create a new store.
 */
const create = async ({ id, name, email, address, owner_id }) => {
  const { rows } = await db.query(
    `INSERT INTO stores (id, name, email, address, owner_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, owner_id, created_at`,
    [id, name, email, address, owner_id]
  );
  return rows[0];
};

/**
 * Find store by ID. Also includes owner info and avg rating via JOIN.
 */
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT
       s.id,
       s.name,
       s.email,
       s.address,
       s.owner_id,
       s.created_at,
       u.name    AS owner_name,
       u.email   AS owner_email,
       ROUND(AVG(r.rating), 2) AS avg_rating,
       COUNT(r.id)::INT        AS total_ratings
     FROM stores s
     LEFT JOIN users u  ON u.id = s.owner_id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = $1
     GROUP BY s.id, u.name, u.email`,
    [id]
  );
  return rows[0] || null;
};

/**
 * List stores with optional name/address search, sorting, and pagination.
 * Includes avg rating and the requesting user's submitted rating (if userId provided).
 *
 * @param {Object} opts
 * @param {string} [opts.search]
 * @param {string} [opts.sortBy]
 * @param {string} [opts.order]
 * @param {number} [opts.limit]
 * @param {number} [opts.offset]
 * @param {string} [opts.userId] - for fetching user's own rating per store
 */
const list = async ({ search = '', sortBy = 's.name', order = 'ASC', limit = 10, offset = 0, userId = null }) => {
  const allowedSort = ['s.name', 's.address', 'avg_rating', 's.created_at'];
  const safeSort = allowedSort.includes(sortBy) ? sortBy : 's.name';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const params = [];
  let idx = 1;

  let userRatingJoin = '';
  let userRatingSelect = '';

  if (userId) {
    userRatingSelect = `, ur.rating AS user_rating`;
    userRatingJoin = `LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $${idx}`;
    params.push(userId);
    idx++;
  }

  let whereClause = '';
  if (search) {
    whereClause = `WHERE (s.name ILIKE $${idx} OR s.address ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }

  const sql = `
    SELECT
      s.id,
      s.name,
      s.email,
      s.address,
      ROUND(AVG(r.rating), 2) AS avg_rating,
      COUNT(r.id)::INT        AS total_ratings
      ${userRatingSelect}
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${userRatingJoin}
    ${whereClause}
    GROUP BY s.id ${userId ? ', ur.rating' : ''}
    ORDER BY ${safeSort} ${safeOrder}
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  params.push(limit, offset);

  const countSql = `
    SELECT COUNT(*) AS total
    FROM stores s
    ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    db.query(sql, params),
    db.query(countSql, userId ? params.slice(1, params.length - 2) : params.slice(0, params.length - 2)),
  ]);

  return {
    stores: dataResult.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

/**
 * Get the store owned by a specific user.
 */
const findByOwnerId = async (owner_id) => {
  const { rows } = await db.query(
    `SELECT id, name, email, address FROM stores WHERE owner_id = $1 LIMIT 1`,
    [owner_id]
  );
  return rows[0] || null;
};

/**
 * Count total stores.
 */
const count = async () => {
  const { rows } = await db.query('SELECT COUNT(*) AS total FROM stores');
  return parseInt(rows[0].total);
};

module.exports = { create, findById, list, findByOwnerId, count };
