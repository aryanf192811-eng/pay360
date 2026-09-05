'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/departments.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];
const ALL_ROLES = ['employee', ...HR_ROLES];

router.use(authenticate);

router.get('/', authorize(...ALL_ROLES), ctrl.list);
router.get('/:id', authorize(...ALL_ROLES), ctrl.getById);
router.post('/', authorize(...HR_ROLES), ctrl.create);
router.patch('/:id', authorize(...HR_ROLES), ctrl.update);

module.exports = router;
