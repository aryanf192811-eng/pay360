'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/timeOffRequests.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];
const ALL_ROLES = ['employee', ...HR_ROLES];

router.use(authenticate, authorize(...ALL_ROLES));

router.get('/', ctrl.list);   // employees see only their own (enforced in controller)
router.post('/', ctrl.create); // employees may only create for themselves (enforced in controller)
router.post('/:id/approve', authorize(...HR_ROLES), ctrl.approve);
router.post('/:id/refuse', authorize(...HR_ROLES), ctrl.refuse);

module.exports = router;
