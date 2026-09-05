'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/timeOffAllocations.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...HR_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/:id/approve', ctrl.approve);

module.exports = router;
