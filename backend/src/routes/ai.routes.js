'use strict';

const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../middleware/auth');

const PAYROLL_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];

// Real API cost per call (CLAUDE.md's explicit risk flag) — capped per authenticated user, not
// per IP, since this sits behind auth already. 15/hour is generous for real usage, tight enough
// that one runaway UI bug or a bored user can't turn this into an unbounded bill.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1_000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: { message: 'Too many AI assistant questions this hour — try again later', code: 'RATE_LIMIT' } },
});

router.use(authenticate, authorize(...PAYROLL_ROLES));

router.get('/status', ctrl.status);
router.post('/ask', aiLimiter, ctrl.ask);

module.exports = router;
