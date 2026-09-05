'use strict';

const pino = require('pino');

// Structured JSON logger — fast, zero overhead in production.
// pino-pretty (optional dev companion) is NOT installed as a dep to keep the
// production bundle lean; pipe output through `npx pino-pretty` locally if needed.
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

module.exports = logger;
