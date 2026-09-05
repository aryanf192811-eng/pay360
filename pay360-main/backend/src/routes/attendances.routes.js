'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/attendances.controller');
const { authenticate, authorize } = require('../middleware/auth');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];
const ALL_ROLES = ['employee', ...HR_ROLES];

router.use(authenticate, authorize(...ALL_ROLES));

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create); // employees may check themselves in/out; HR may check in anyone
router.patch('/:id', authorize(...HR_ROLES), ctrl.update); // manual correction — HR roles only

module.exports = router;
