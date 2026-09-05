'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/auditLogs.controller');
const { authenticate, authorize } = require('../middleware/auth');

// Sensitive historical trail spanning contracts + payroll — restricted to the two roles with
// "full control over HR and payroll-related records" / "full access to all modules" (PS §3),
// not exposed to hr_manager or hr_payroll_user.
router.use(authenticate, authorize('hr_payroll_manager', 'admin'));

router.get('/', ctrl.list);

module.exports = router;
