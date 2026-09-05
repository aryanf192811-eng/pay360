'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/salaryStructures.controller');
const { authenticate, authorize } = require('../middleware/auth');

// PS role table: HR Manager has explicitly "no access to payroll features" — Salary
// Structures/Rules are payroll features, so hr_manager is deliberately NOT in this list.
const READ_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];
const WRITE_ROLES = ['hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...READ_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize(...WRITE_ROLES), ctrl.create);
router.patch('/:id', authorize(...WRITE_ROLES), ctrl.update);

module.exports = router;
