'use strict';

const router = require('express').Router();
const ctrl = require('../controllers/insights.controller');
const { authenticate, authorize } = require('../middleware/auth');

// HR domain (attendance + leave), not payroll-only — matches who already sees Attendance/Time
// Off in the app (HR_ROLES), not gated further to PAYROLL_ROLES.
const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

router.use(authenticate, authorize(...HR_ROLES));

router.get('/attendance-anomalies', ctrl.attendanceAnomalies);
router.get('/leave-forecast', ctrl.leaveForecast);

module.exports = router;
