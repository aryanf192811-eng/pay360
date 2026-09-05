'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middleware/auth');

// This is explicitly the "Payroll Dashboard" (PS §A7/§B9) and surfaces net-salary/payroll-cost
// figures — a payroll feature, so hr_manager is excluded here too, same reasoning as
// salary-structures/salary-rules (PS: hr_manager has "no access to payroll features").
const PAYROLL_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...PAYROLL_ROLES));

router.get('/', ctrl.getDashboard);

module.exports = router;
