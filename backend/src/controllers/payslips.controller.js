'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

// ─── GET /api/payslips?payrun_id=&employee_id= ────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { payrun_id, employee_id } = req.query;
    const conditions = [];
    const params = [];

    if (payrun_id) { params.push(payrun_id); conditions.push(`ps.payrun_id = $${params.length}`); }
    if (employee_id) { params.push(employee_id); conditions.push(`ps.employee_id = $${params.length}`); }

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
