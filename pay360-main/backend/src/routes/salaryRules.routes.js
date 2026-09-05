'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/salaryRules.controller');
const { authenticate, authorize } = require('../middleware/auth');

const READ_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];
const WRITE_ROLES = ['hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...READ_ROLES));

router.get('/', ctrl.list);
router.post('/', authorize(...WRITE_ROLES), ctrl.create);
router.patch('/:id', authorize(...WRITE_ROLES), ctrl.update);

module.exports = router;
