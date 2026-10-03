'use strict';
const db = require('../config/db');

/**
 * Find a user by email.
 * @param {string} email
 */
const findByEmail = async (email) => {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

/**
 * Find a user by ID. Excludes password hash.
 * @param {string} id
 */
const findById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

/**
 * Create a new user.
 */
const create = async ({ id, name, email, address, password, role }) => {
  const { rows } = await db.query(
    `INSERT INTO users (id, name, email, address, password, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, address, role, created_at`,
    [id, name, email, address, password, role]
  );
  return rows[0];
};

/**
 * Update a user's password.
 */
const updatePassword = async (id, hashedPassword) => {
  const { rows } = await db.query(
    `UPDATE users SET password = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [hashedPassword, id]
  );
  return rows[0] || null;
};

/**
 * List users with optional filters, sorting, and pagination.
 * Returns users with their store average rating if they are store owners (JOIN).
 *
 * @param {Object} opts
 * @param {string} [opts.search]
 * @param {string} [opts.role]
 * @param {string} [opts.sortBy]
 * @param {string} [opts.order]
 * @param {number} [opts.limit]
 * @param {number} [opts.offset]
 */
const list = async ({ search = '', role = '', sortBy = 'u.created_at', order = 'DESC', limit = 10, offset = 0 }) => {
  const allowedSort = ['u.name', 'u.email', 'u.address', 'u.role', 'u.created_at'];
  const safeSort = allowedSort.includes(sortBy) ? sortBy : 'u.created_at';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const params = [];
  const conditions = [];
  let idx = 1;

  if (search) {
    conditions.push(
      `(u.name ILIKE $${idx} OR u.email ILIKE $${idx} OR u.address ILIKE $${idx})`
    );
    params.push(`%${search}%`);
    idx++;
  }
  if (role) {
    conditions.push(`u.role = $${idx}`);
    params.push(role);
    idx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  // JOIN with stores + ratings to get avg rating for store owners in one query
  const sql = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.address,
      u.role,
      u.created_at,
      ROUND(AVG(r.rating), 2) AS avg_store_rating
    FROM users u
    LEFT JOIN stores s ON s.owner_id = u.id
    LEFT JOIN ratings r ON r.store_id = s.id
    ${whereClause}
    GROUP BY u.id
    ORDER BY ${safeSort} ${safeOrder}
    LIMIT $${idx} OFFSET $${idx + 1}
  `;
  params.push(limit, offset);

  const countSql = `
    SELECT COUNT(DISTINCT u.id) AS total
    FROM users u
    ${whereClause}
  `;

  const [dataResult, countResult] = await Promise.all([
    db.query(sql, params),
    db.query(countSql, params.slice(0, params.length - 2)),
  ]);

  return {
    users: dataResult.rows,
    total: parseInt(countResult.rows[0].total),
  };
};

/**
 * Get full user detail including store avg rating if store_owner.
 */
const getDetailById = async (id) => {
  const { rows } = await db.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.address,
       u.role,
       u.created_at,
       ROUND(AVG(r.rating), 2) AS avg_store_rating
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE u.id = $1
     GROUP BY u.id`,
    [id]
  );
  return rows[0] || null;
};

/**
 * Count total users.
 */
const count = async () => {
  const { rows } = await db.query('SELECT COUNT(*) AS total FROM users');
  return parseInt(rows[0].total);
};

module.exports = { findByEmail, findById, create, updatePassword, list, getDetailById, count };
