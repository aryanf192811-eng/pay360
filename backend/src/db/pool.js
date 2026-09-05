'use strict';

const { Pool, types } = require('pg');
const logger = require('../utils/logger');

// node-pg's default DATE (OID 1082) parser returns a JS Date object, which JSON.stringify then
// serializes via toISOString() — that converts to UTC and can shift the calendar date by a full
// day whenever the server's local timezone is ahead of UTC (e.g. '2026-01-01' becomes
// '2025-12-31T18:30:00.000Z' at UTC+5:30). A plain SQL `date` column has no timezone — it should
// never round-trip through one. Returning the raw 'YYYY-MM-DD' string instead fixes every date
// field in the schema at once (contract/payrun/payslip periods, hire_date, etc.) without needing
// a per-query workaround. timestamptz columns (created_at, check_in, ...) are untouched — those
// really are instants and should keep their normal Date/ISO handling.
types.setTypeParser(1082, (val) => val);

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
