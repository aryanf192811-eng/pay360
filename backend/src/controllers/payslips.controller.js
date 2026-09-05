'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

function assertOwnRecordOrPayroll(req, employeeId) {
  if (req.user.role === 'employee' && req.user.employee_id !== employeeId) {
    const e = new Error('Employees may only view their own payslips'); e.statusCode = 403; throw e;
  }
}

// ─── GET /api/payslips?payrun_id=&employee_id= ────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { payrun_id, employee_id } = req.query;
    const conditions = [];
    const params = [];

    // Employee role only ever sees their own payslips, regardless of query params sent.
    if (req.user.role === 'employee') {
      params.push(req.user.employee_id);
      conditions.push(`ps.employee_id = $${params.length}`);
    } else if (employee_id) {
      params.push(employee_id);
      conditions.push(`ps.employee_id = $${params.length}`);
    }
    if (payrun_id) { params.push(payrun_id); conditions.push(`ps.payrun_id = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Net is read live from payslip_lines (Ledger Pattern, DB_GUIDE.md) — never a stored column.
    const { rows } = await pool.query(
      `SELECT ps.id, ps.payrun_id, ps.employee_id, ps.contract_id, ps.structure_id,
              ps.period_start, ps.period_end, ps.worked_days, ps.status, ps.email_status,
              e.first_name, e.last_name,
              (SELECT amount FROM payslip_lines pl WHERE pl.payslip_id = ps.id AND pl.category = 'net' ORDER BY pl.sequence DESC LIMIT 1) AS net
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       ${where}
       ORDER BY ps.created_at DESC`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── GET /api/payslips/:id — includes its payslip_lines, sequence order ───────────────────────

async function getById(req, res, next) {
  try {
    // PS §B7: "Displays key identification attributes: Employee, Structure, Pay Run, Period,
    // Status, and Worked Days" — Structure/Pay Run must be shown by name, not just id.
    const { rows } = await pool.query(
      `SELECT ps.id, ps.payrun_id, ps.employee_id, ps.contract_id, ps.structure_id,
              ps.period_start, ps.period_end, ps.worked_days, ps.status, ps.email_status,
              e.first_name, e.last_name, e.employee_code,
              s.name AS structure_name, p.name AS payrun_name
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       LEFT JOIN salary_structures s ON s.id = ps.structure_id
       LEFT JOIN payruns p ON p.id = ps.payrun_id
       WHERE ps.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Payslip not found'); e.statusCode = 404; throw e; }
    assertOwnRecordOrPayroll(req, rows[0].employee_id);

    const { rows: lines } = await pool.query(
      `SELECT id, salary_rule_id, code, name, category, sequence, amount
       FROM payslip_lines WHERE payslip_id = $1 ORDER BY sequence ASC`,
      [req.params.id]
    );

    return sendSuccess(res, { ...rows[0], lines });
  } catch (err) { next(err); }
}

//  GET /api/payslips/:id/pdf - stream PDF

async function getPdf(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT ps.id, ps.payrun_id, ps.employee_id, ps.contract_id, ps.structure_id,
              ps.period_start, ps.period_end, ps.worked_days, ps.status, ps.email_status,
              e.first_name, e.last_name, e.employee_code
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       WHERE ps.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Payslip not found'); e.statusCode = 404; throw e; }
    assertOwnRecordOrPayroll(req, rows[0].employee_id);

    const { rows: lines } = await pool.query(
      `SELECT id, salary_rule_id, code, name, category, sequence, amount
       FROM payslip_lines WHERE payslip_id = $1 ORDER BY sequence ASC`,
      [req.params.id]
    );

    const { generatePayslipPdf } = require('../services/pdf.service');
    const pdfBuffer = await generatePayslipPdf(rows[0], lines);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="payslip_${req.params.id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err) { next(err); }
}

module.exports = { list, getById, getPdf };
