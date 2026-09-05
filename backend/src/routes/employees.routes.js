'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/employees.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];
const ALL_ROLES = ['employee', ...HR_ROLES];

router.use(authenticate, authorize(...ALL_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize(...HR_ROLES), ctrl.create);
router.patch('/:id', authorize(...HR_ROLES), ctrl.update);

router.get('/:id/contracts', ctrl.listContracts);
router.get('/:id/attendances', ctrl.listAttendances);
router.get('/:id/time-off-requests', ctrl.listTimeOffRequests);
router.get('/:id/allocations', ctrl.listAllocations);

module.exports = router;
