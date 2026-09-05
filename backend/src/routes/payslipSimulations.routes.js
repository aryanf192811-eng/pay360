'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/payslipSimulations.controller');
const { authenticate, authorize } = require('../middleware/auth');

const PAYROLL_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...PAYROLL_ROLES));

router.post('/', ctrl.create);

module.exports = router;
