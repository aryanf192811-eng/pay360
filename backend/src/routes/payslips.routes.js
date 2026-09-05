'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/payslips.controller');
const { authenticate, authorize } = require('../middleware/auth');

const PAYROLL_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];
// PS §3's role table is silent on employee payslip access (it grants "attendance records and
// leave balances" explicitly but doesn't mention payslips either way) — self-service without
// seeing your own pay is not real self-service, so `employee` is included here, scoped to their
// own records only (enforced in the controller, same ownership pattern as employees/attendance).
const ALL_ROLES = ['employee', ...PAYROLL_ROLES];

router.use(authenticate, authorize(...ALL_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/pdf', ctrl.getPdf);

module.exports = router;
