'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/payslips.controller');
const { authenticate, authorize } = require('../middleware/auth');

const PAYROLL_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...PAYROLL_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/pdf', ctrl.getPdf);

module.exports = router;
