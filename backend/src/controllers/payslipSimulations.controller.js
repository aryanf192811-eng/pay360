'use strict';

const { simulatePayslip } = require('../services/payrollEngine.service');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

// ─── POST /api/payslip-simulations — Tier-2 What-If Simulator (payroll roles only) ─────────────
// Runs the exact same computePayslipCore the real payroll engine uses, against a scratch
// payrun+payslip that is rolled back before this request returns — see payrollEngine.service.js's
// simulatePayslip for why this can never drift from real payroll math.

async function create(req, res, next) {
  try {
    const { employee_id, period_start, period_end, salary_structure_id } = req.body;

    if (!employee_id) { const e = new Error('employee_id is required'); e.statusCode = 422; throw e; }
    if (!salary_structure_id) { const e = new Error('salary_structure_id is required'); e.statusCode = 422; throw e; }
    if (!period_start || !period_end) {
      const e = new Error('period_start and period_end are required'); e.statusCode = 422; throw e;
    }
    if (new Date(period_end) < new Date(period_start)) {
      const e = new Error('period_end must not be before period_start'); e.statusCode = 422; throw e;
    }

    const result = await simulatePayslip({
      employeeId: employee_id,
      periodStart: period_start,
      periodEnd: period_end,
      salaryStructureId: salary_structure_id,
    });

    logger.info({ employee_id, salary_structure_id, period_start, period_end, computed: result.computed }, 'payroll what-if simulation run');
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

module.exports = { create };
