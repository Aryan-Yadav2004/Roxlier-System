'use strict';
/**
 * Database migration script.
 * Run: node src/config/migrate.js
 *
 * Creates all tables with proper constraints and seeds sample data.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { query } = require('./db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const migrate = async () => {
  console.log('🔧 Running migrations...');

  // Enable UUID extension
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

  // ─────────────────────────────────────────────
  // TABLE: users
  // ─────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
      name        VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
      email       VARCHAR(255) NOT NULL UNIQUE,
      password    TEXT         NOT NULL,
      address     VARCHAR(400) NOT NULL DEFAULT '',
      role        VARCHAR(20)  NOT NULL DEFAULT 'user'
                  CHECK (role IN ('admin', 'user', 'store_owner')),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Table: users');

  // ─────────────────────────────────────────────
  // TABLE: stores
  // ─────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS stores (
      id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
      name        VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
      email       VARCHAR(255) NOT NULL UNIQUE,
      address     VARCHAR(400) NOT NULL DEFAULT '',
      owner_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Table: stores');

  // ─────────────────────────────────────────────
  // TABLE: ratings
  // ─────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      store_id    UUID         NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      rating      SMALLINT     NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, store_id)
    );
  `);
  console.log('  ✅ Table: ratings');

  // ─────────────────────────────────────────────
  // TABLE: refresh_tokens
  // ─────────────────────────────────────────────
  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT         NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ  NOT NULL,
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);
  console.log('  ✅ Table: refresh_tokens');

  // ─────────────────────────────────────────────
  // INDEXES for performance
  // ─────────────────────────────────────────────
  await query(`CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_users_role     ON users(role)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_stores_owner   ON stores(owner_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_ratings_store  ON ratings(store_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_ratings_user   ON ratings(user_id)`);
  await query(`CREATE INDEX IF NOT EXISTS idx_tokens_user    ON refresh_tokens(user_id)`);
  console.log('  ✅ Indexes created');

  // ─────────────────────────────────────────────
  // SEED DATA
  // ─────────────────────────────────────────────
  console.log('\n🌱 Seeding sample data...');

  const adminPass   = await bcrypt.hash('Admin@Secure1', BCRYPT_ROUNDS);
  const ownerPass   = await bcrypt.hash('Owner@Secure1', BCRYPT_ROUNDS);
  const userPass    = await bcrypt.hash('User@Secure1!', BCRYPT_ROUNDS);

  // IDs
  const adminId  = uuidv4();
  const owner1Id = uuidv4();
  const owner2Id = uuidv4();
  const user1Id  = uuidv4();
  const user2Id  = uuidv4();
  const user3Id  = uuidv4();

  // Insert users
  await query(`
    INSERT INTO users (id, name, email, password, address, role) VALUES
      ($1, 'System Administrator Account', 'admin@roxlier.com', $2, '123 Admin Street, Tech City, TC 10001', 'admin'),
      ($3, 'First Store Owner Person',     'owner1@roxlier.com', $4, '456 Owner Lane, Commerce City, CC 20002', 'store_owner'),
      ($5, 'Second Store Owner Person',    'owner2@roxlier.com', $4, '789 Business Blvd, Trade Town, TT 30003', 'store_owner'),
      ($6, 'Alice Johnson Regular User',   'alice@example.com',  $7, '321 User Ave, Resident City, RC 40004', 'user'),
      ($8, 'Bob Smith Normal Platform User','bob@example.com',   $7, '654 Normal St, Customer Town, CT 50005', 'user'),
      ($9, 'Charlie Brown Active Reviewer', 'charlie@example.com',$7, '987 Review Rd, Rating City, RC 60006', 'user')
    ON CONFLICT (email) DO NOTHING
  `, [adminId, adminPass, owner1Id, ownerPass, owner2Id, user1Id, userPass, user2Id, user3Id]);
  console.log('  ✅ Users seeded');

  // Insert stores
  const store1Id = uuidv4();
  const store2Id = uuidv4();
  const store3Id = uuidv4();

  await query(`
    INSERT INTO stores (id, name, email, address, owner_id) VALUES
      ($1, 'The Grand Grocery Supermarket', 'grandgrocery@roxlier.com', '100 Market Street, Food District, FD 10001', $4),
      ($2, 'Tech Electronics and Gadgets', 'techelectronics@roxlier.com', '200 Tech Boulevard, Silicon Valley, SV 20002', $4),
      ($3, 'Fashion Boutique and Clothing', 'fashionboutique@roxlier.com', '300 Style Avenue, Fashion Row, FR 30003', $5)
    ON CONFLICT (email) DO NOTHING
  `, [store1Id, store2Id, store3Id, owner1Id, owner2Id]);
  console.log('  ✅ Stores seeded');

  // Insert ratings
  await query(`
    INSERT INTO ratings (id, user_id, store_id, rating) VALUES
      ($1,  $4, $7, 5),
      ($2,  $5, $7, 4),
      ($3,  $6, $7, 3),
      ($10, $4, $8, 5),
      ($11, $5, $8, 2),
      ($12, $6, $9, 4),
      ($13, $4, $9, 5)
    ON CONFLICT (user_id, store_id) DO NOTHING
  `, [
    uuidv4(), uuidv4(), uuidv4(),
    user1Id, user2Id, user3Id,
    store1Id, store2Id, store3Id,
    uuidv4(), uuidv4(), uuidv4(), uuidv4(),
  ]);
  console.log('  ✅ Ratings seeded');

  console.log('\n✨ Migration and seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('  Admin:       admin@roxlier.com   / Admin@Secure1');
  console.log('  Store Owner: owner1@roxlier.com  / Owner@Secure1');
  console.log('  Store Owner: owner2@roxlier.com  / Owner@Secure1');
  console.log('  User:        alice@example.com   / User@Secure1!');
  console.log('  User:        bob@example.com     / User@Secure1!');
  console.log('  User:        charlie@example.com / User@Secure1!');

  process.exit(0);
};

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
