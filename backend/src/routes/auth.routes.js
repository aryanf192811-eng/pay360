'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Tighter rate limit for auth endpoints — 20 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1_000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many auth attempts', code: 'RATE_LIMIT' } },
});

// Self-register: unauthenticated by design.
// optionally authenticated — if the caller IS authenticated as admin, they can register
// any role; otherwise role is locked to 'employee' inside the controller.
router.post('/register', authLimiter, ctrl.register);

router.post('/login', authLimiter, ctrl.login);

// Refresh reads the httpOnly cookie — no Bearer token needed or expected here
router.post('/refresh', ctrl.refresh);

// Logout optionally authenticated (we clear the cookie regardless)
router.post('/logout', ctrl.logout);

// /me requires a valid access token
router.get('/me', authenticate, ctrl.me);

module.exports = router;
