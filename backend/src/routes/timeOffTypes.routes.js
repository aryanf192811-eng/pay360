'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/timeOffTypes.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate);

router.get('/', ctrl.list); // any authenticated role may read the configured types
router.get('/:id', ctrl.getById);
router.post('/', authorize(...HR_ROLES), ctrl.create);
router.patch('/:id', authorize(...HR_ROLES), ctrl.update);

module.exports = router;
