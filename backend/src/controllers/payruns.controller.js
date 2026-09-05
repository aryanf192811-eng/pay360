'use strict';

const pool = require('../db/pool');
const { listEligibleEmployees } = require('../services/contracts.service');
const { computePayrun } = require('../services/payrollEngine.service');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

function validatePeriod(period_start, period_end) {
  if (!period_start || !period_end) {
    const e = new Error('period_start and period_end are required'); e.statusCode = 422; throw e;
  }
  if (new Date(period_end) < new Date(period_start)) {
    const e = new Error('period_end must not be before period_start'); e.statusCode = 422; throw e;
  }
}

// ─── POST /api/payruns/draft — wizard step 1: scope+period, no row created ────────────────────

async function draft(req, res, next) {
  try {
    const { salary_structure_id, period_start, period_end } = req.body;

    if (!salary_structure_id) {
      const e = new Error('salary_structure_id is required'); e.statusCode = 422; throw e;
    }
    validatePeriod(period_start, period_end);

    const { rows: structRows } = await pool.query(
      `SELECT id, name FROM salary_structures WHERE id = $1 AND active = true`,
      [salary_structure_id]
    );
    if (!structRows[0]) {
      const e = new Error('Salary structure not found or inactive'); e.statusCode = 404; throw e;
    }

    // Real, live eligibility list — never a static/hardcoded employee list (Dynamic Data Mandate).
    const eligibleEmployees = await listEligibleEmployees(period_start, period_end);

    return sendSuccess(res, {
      salary_structure: structRows[0],
      period_start,
      period_end,
      eligible_employees: eligibleEmployees,
    });
  } catch (err) { next(err); }
}

// ─── POST /api/payruns — wizard step 2: finalize with employee_ids[] ──────────────────────────

async function create(req, res, next) {
  const client = await pool.connect();
  try {
    const { name, salary_structure_id, period_start, period_end, employee_ids } = req.body;

    if (!name || !salary_structure_id) {
      const e = new Error('name and salary_structure_id are required'); e.statusCode = 422; throw e;
    }
    validatePeriod(period_start, period_end);
    if (!Array.isArray(employee_ids) || employee_ids.length === 0) {
      const e = new Error('employee_ids must be a non-empty array'); e.statusCode = 422; throw e;
    }

    // PS/DB_GUIDE.md: duplicate_payslip is meant to be a pre-emptive WARNING, not a hard failure
    // that aborts the whole payrun over one duplicated employee_id in the submitted array.
    // Dedupe here and record a warning instead of letting the payslips unique-constraint abort
    // the transaction.
    const uniqueEmployeeIds = [...new Set(employee_ids)];
    const duplicates = employee_ids.length - uniqueEmployeeIds.length;

    await client.query('BEGIN');

    const { rows: payrunRows } = await client.query(
      `INSERT INTO payruns (name, salary_structure_id, period_start, period_end, status, created_by)
       VALUES ($1, $2, $3, $4, 'draft', $5)
       RETURNING id, name, salary_structure_id, period_start, period_end, status, created_at`,
      [name, salary_structure_id, period_start, period_end, req.user.id]
    );
    const payrun = payrunRows[0];

    for (const employeeId of uniqueEmployeeIds) {
      await client.query(
        `INSERT INTO payrun_employees (payrun_id, employee_id) VALUES ($1, $2)`,
        [payrun.id, employeeId]
      );
      await client.query(
        `INSERT INTO payslips (payrun_id, employee_id, structure_id, period_start, period_end, status)
         VALUES ($1, $2, $3, $4, $5, 'draft')`,
        [payrun.id, employeeId, salary_structure_id, period_start, period_end]
      );
    }

    if (duplicates > 0) {
      await client.query(
        `INSERT INTO payroll_warnings (payrun_id, warning_type, message)
         VALUES ($1, 'duplicate_payslip', $2)`,
        [payrun.id, `${duplicates} duplicate employee selection(s) were removed — one payslip per employee was created`]
      );
    }

    await client.query('COMMIT');
    logger.info({ payrunId: payrun.id, employeeCount: uniqueEmployeeIds.length, duplicates }, 'payrun created');

    return sendSuccess(res, payrun, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      err.message = 'Duplicate employee in selection, or a payslip already exists for one of these employees in this payrun';
      err.statusCode = 409;
    }
    next(err);
  } finally {
    client.release();
  }
}

// ─── GET /api/payruns ──────────────────────────────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.salary_structure_id, p.period_start, p.period_end, p.status, p.created_at,
              (SELECT COUNT(*) FROM payslips ps WHERE ps.payrun_id = p.id) AS payslip_count
       FROM payruns p
       ORDER BY p.created_at DESC`
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── GET /api/payruns/:id ──────────────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, salary_structure_id, period_start, period_end, status, created_by, created_at, updated_at
       FROM payruns WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Payrun not found'); e.statusCode = 404; throw e; }

    const { rows: warnings } = await pool.query(
      `SELECT id, payslip_id, warning_type, message, resolved
       FROM payroll_warnings
       WHERE payrun_id = $1 OR payslip_id IN (SELECT id FROM payslips WHERE payrun_id = $1)`,
      [req.params.id]
    );

    return sendSuccess(res, { ...rows[0], warnings });
  } catch (err) { next(err); }
}

// ─── POST /api/payruns/:id/compute ─────────────────────────────────────────────────────────────

async function compute(req, res, next) {
  try {
    const { rows } = await pool.query(`SELECT id, status FROM payruns WHERE id = $1`, [req.params.id]);
    if (!rows[0]) { const e = new Error('Payrun not found'); e.statusCode = 404; throw e; }

    const results = await computePayrun(req.params.id);

    await pool.query(
      `UPDATE payruns SET status = 'computed', updated_at = now() WHERE id = $1`,
      [req.params.id]
    );

    const { rows: warnings } = await pool.query(
      `SELECT id, payslip_id, warning_type, message
       FROM payroll_warnings
       WHERE payrun_id = $1 OR payslip_id IN (SELECT id FROM payslips WHERE payrun_id = $1)`,
      [req.params.id]
    );

    logger.info({ payrunId: req.params.id, count: results.length, warningCount: warnings.length }, 'payrun computed');
    return sendSuccess(res, { results, warnings });
  } catch (err) { next(err); }
}

// ─── POST /api/payruns/:id/validate ─────────────────────────────────────────────────────────────

async function validate(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT id, status FROM payruns WHERE id = $1 FOR UPDATE`, [req.params.id]);
    if (!rows[0]) { const e = new Error('Payrun not found'); e.statusCode = 404; throw e; }

    // Blocking warnings only: contract_missing. Missing bank details / negative net are advisory.
    const { rows: blocking } = await client.query(
      `SELECT id, message FROM payroll_warnings
       WHERE warning_type = 'contract_missing' AND resolved = false
         AND (payrun_id = $1 OR payslip_id IN (SELECT id FROM payslips WHERE payrun_id = $1))`,
      [req.params.id]
    );
    if (blocking.length > 0) {
      const e = new Error(`Cannot validate: ${blocking.length} unresolved contract_missing warning(s)`);
      e.statusCode = 409;
      throw e;
    }

    await client.query(`UPDATE payruns SET status = 'validated', updated_at = now() WHERE id = $1`, [req.params.id]);
    await client.query(
      `UPDATE payslips SET status = 'validated', updated_at = now() WHERE payrun_id = $1 AND status = 'computed'`,
      [req.params.id]
    );

    await client.query('COMMIT');
    logger.info({ payrunId: req.params.id }, 'payrun validated');
    return sendSuccess(res, { id: req.params.id, status: 'validated' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

// ─── POST /api/payruns/:id/mark-paid ────────────────────────────────────────────────────────────

async function markPaid(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT id, status FROM payruns WHERE id = $1 FOR UPDATE`, [req.params.id]);
    if (!rows[0]) { const e = new Error('Payrun not found'); e.statusCode = 404; throw e; }
    if (rows[0].status !== 'validated') {
      const e = new Error(`Payrun must be validated before it can be marked paid (current status: ${rows[0].status})`);
      e.statusCode = 409;
      throw e;
    }

    await client.query(`UPDATE payruns SET status = 'paid', updated_at = now() WHERE id = $1`, [req.params.id]);
    await client.query(
      `UPDATE payslips SET status = 'paid', updated_at = now() WHERE payrun_id = $1 AND status = 'validated'`,
      [req.params.id]
    );

    await client.query('COMMIT');
    logger.info({ payrunId: req.params.id }, 'payrun marked paid');
    return sendSuccess(res, { id: req.params.id, status: 'paid' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

//  POST /api/payruns/:id/send-payslips 

async function sendPayslips(req, res, next) {
  try {
    const { rows: payrunRows } = await pool.query(
      `SELECT id, status, period_start, period_end FROM payruns WHERE id = $1`,
      [req.params.id]
    );
    if (!payrunRows[0]) { const e = new Error('Payrun not found'); e.statusCode = 404; throw e; }
    const payrun = payrunRows[0];

    // Find all payslips
    const { rows: payslips } = await pool.query(
      `SELECT ps.id, ps.employee_id, ps.status, e.email
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       WHERE ps.payrun_id = $1`,
      [req.params.id]
    );

    const { sendPayslipEmail } = require('../services/email.service');
    const { generatePayslipPdf } = require('../services/pdf.service');

    let queuedCount = 0;
    let sentCount = 0;
    let failedCount = 0;

    for (const ps of payslips) {
      if (!ps.email) continue; // Can't send if no email

      // Generate PDF
      const { rows: psData } = await pool.query(
        `SELECT ps.id, ps.payrun_id, ps.employee_id, ps.contract_id, ps.structure_id,
                ps.period_start, ps.period_end, ps.worked_days, ps.status, ps.email_status,
                e.first_name, e.last_name, e.employee_code
         FROM payslips ps
         JOIN employees e ON e.id = ps.employee_id
         WHERE ps.id = $1`,
        [ps.id]
      );
      
      const { rows: lines } = await pool.query(
        `SELECT id, salary_rule_id, code, name, category, sequence, amount
         FROM payslip_lines WHERE payslip_id = $1 ORDER BY sequence ASC`,
        [ps.id]
      );
      
      try {
        const pdfBuffer = await generatePayslipPdf(psData[0], lines);
        const success = await sendPayslipEmail(
          ps.email, 
          payrun.period_start, 
          payrun.period_end, 
          pdfBuffer
        );
        
        const newStatus = success ? 'sent' : 'queued_no_provider';
        if (success) sentCount++;
        else queuedCount++;
        
        await pool.query(`UPDATE payslips SET email_status = $1, updated_at = now() WHERE id = $2`, [newStatus, ps.id]);
      } catch (err) {
        failedCount++;
        await pool.query(`UPDATE payslips SET email_status = 'failed', updated_at = now() WHERE id = $1`, [ps.id]);
        logger.error({ err, payslipId: ps.id }, 'Error processing payslip email');
      }
    }

    return sendSuccess(res, {
      message: 'Payslip emails processed',
      stats: { sent: sentCount, queued: queuedCount, failed: failedCount }
    });
  } catch (err) { next(err); }
}

module.exports = { draft, create, list, getById, compute, validate, markPaid, sendPayslips };
