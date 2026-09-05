'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/contracts.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...HR_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);

module.exports = router;
