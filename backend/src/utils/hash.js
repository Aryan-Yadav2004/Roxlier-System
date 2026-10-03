'use strict';
const bcrypt = require('bcryptjs');

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

/**
 * Hash a plain-text password.
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = (password) => bcrypt.hash(password, ROUNDS);

/**
 * Compare a plain-text password against a stored hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

module.exports = { hashPassword, comparePassword };
