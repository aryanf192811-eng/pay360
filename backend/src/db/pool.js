'use strict';

const { Pool } = require('pg');
const logger = require('../utils/logger');

// DATABASE_URL must be set in environment (see .env.example)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Explicit pool sizing — enough for the single-server dev/demo context
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

// Log pool-level errors so they surface clearly rather than silently hanging requests
pool.on('error', (err) => {
  logger.error({ err }, 'pg pool idle-client error');
});

// Eagerly verify connectivity on startup — fail fast if DATABASE_URL is wrong
pool.connect((err, client, release) => {
  if (err) {
    logger.error({ err }, 'Failed to acquire initial DB connection — check DATABASE_URL');
    // Do NOT process.exit here; let the server start anyway so /health can report the state
  } else {
    logger.info('Database connection pool initialized');
    release();
  }
});

module.exports = pool;
