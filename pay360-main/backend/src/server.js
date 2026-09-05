'use strict';

require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');

const PORT = parseInt(process.env.PORT || '4000', 10);

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV }, 'PeoplePay360 API server started');
});

// Graceful shutdown — drain in-flight requests before closing the DB pool
const gracefulShutdown = (signal) => {
  logger.info({ signal }, 'Received shutdown signal, closing server...');
  server.close(() => {
    logger.info('HTTP server closed');
    // Pool is required after app starts, so we require lazily here to avoid
    // a circular-dependency risk if pool initialisation itself fails
    try {
      const pool = require('./db/pool');
      pool.end(() => {
        logger.info('DB pool drained — process exiting');
        process.exit(0);
      });
    } catch {
      process.exit(0);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled promise rejections so they don't swallow errors silently
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});
