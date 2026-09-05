'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const { sendError } = require('./utils/response');

// ─── App ───────────────────────────────────────────────────────────────────────

const app = express();

// ─── Security middleware ───────────────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // allow the refresh-token httpOnly cookie to travel
  })
);

// Global rate limiter — 200 req / 15 min per IP.  Individual auth routes get
// their own stricter limit defined in the auth router.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT' } },
  })
);

// ─── Request parsing ───────────────────────────────────────────────────────────

app.use(express.json());
app.use(cookieParser());

// ─── HTTP request logger ───────────────────────────────────────────────────────

app.use(
  pinoHttp({
    logger,
    // Don't log health-check noise
    autoLogging: { ignore: (req) => req.url === '/health' },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check — no auth, no DB call needed; keeps it always responsive even if
// the DB is unavailable (pool logs its own error separately)
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// Mount domain routers here as they land (Phase 0+)
// app.use('/api/auth',                require('./routes/auth.routes'));
// app.use('/api/departments',         require('./routes/departments.routes'));
// app.use('/api/working-schedules',   require('./routes/workingSchedules.routes'));
// app.use('/api/employees',           require('./routes/employees.routes'));
// app.use('/api/contracts',           require('./routes/contracts.routes'));
// app.use('/api/attendances',         require('./routes/attendances.routes'));
// app.use('/api/time-off-types',      require('./routes/timeOffTypes.routes'));
// app.use('/api/time-off-allocations',require('./routes/timeOffAllocations.routes'));
// app.use('/api/time-off-requests',   require('./routes/timeOffRequests.routes'));
// app.use('/api/salary-structures',   require('./routes/salaryStructures.routes'));
// app.use('/api/salary-rules',        require('./routes/salaryRules.routes'));
// app.use('/api/payruns',             require('./routes/payruns.routes'));
// app.use('/api/payslips',            require('./routes/payslips.routes'));
// app.use('/api/dashboard',           require('./routes/dashboard.routes'));

// ─── 404 catch-all ────────────────────────────────────────────────────────────

app.use((_req, res) => {
  sendError(res, 'Not found', 404, 'NOT_FOUND');
});

// ─── Centralized error handler ────────────────────────────────────────────────
// All controllers throw errors with err.statusCode set; next(err) lands here.

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.statusCode || 500;

  if (status >= 500) {
    logger.error({ err }, 'Unhandled server error');
  } else {
    logger.warn({ err }, 'Client error');
  }

  // Don't leak internal error details in production
  const message =
    status >= 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Something went wrong';

  sendError(res, message, status, err.code || null);
});

module.exports = app;
