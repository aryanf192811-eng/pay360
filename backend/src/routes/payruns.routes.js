'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/payruns.controller');
const { authenticate, authorize } = require('../middleware/auth');

const PAYROLL_ROLES = ['hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...PAYROLL_ROLES));

router.post('/draft', ctrl.draft);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/:id/compute', ctrl.compute);
router.post('/:id/validate', ctrl.validate);
router.post('/:id/mark-paid', ctrl.markPaid);
router.post('/:id/send-payslips', ctrl.sendPayslips);

module.exports = router;
