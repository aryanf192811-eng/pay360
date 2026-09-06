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
    const { payrun_id, employee_id, period_start, period_end } = req.query;
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
    if (period_start) { params.push(period_start); conditions.push(`ps.period_start >= $${params.length}`); }
    if (period_end) { params.push(period_end); conditions.push(`ps.period_end <= $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Net/Basic/Gross are read live from payslip_lines (Ledger Pattern, DB_GUIDE.md) — never
    // stored columns. Structure/Pay Run shown by name (this list spans every payrun, so the
    // payrun name is how a user tells two payslips for the same employee apart at a glance).
    const { rows } = await pool.query(
      `SELECT ps.id, ps.payrun_id, ps.employee_id, ps.contract_id, ps.structure_id,
              ps.period_start, ps.period_end, ps.worked_days, ps.status, ps.email_status,
              e.first_name, e.last_name, e.employee_code,
              s.name AS structure_name, p.name AS payrun_name,
              (SELECT amount FROM payslip_lines pl WHERE pl.payslip_id = ps.id AND pl.category = 'basic' ORDER BY pl.sequence ASC LIMIT 1) AS basic,
              (SELECT amount FROM payslip_lines pl WHERE pl.payslip_id = ps.id AND pl.category = 'gross' ORDER BY pl.sequence DESC LIMIT 1) AS gross,
              (SELECT amount FROM payslip_lines pl WHERE pl.payslip_id = ps.id AND pl.category = 'net' ORDER BY pl.sequence DESC LIMIT 1) AS net,
              (SELECT COUNT(*) FROM payroll_warnings w WHERE w.payslip_id = ps.id AND w.resolved = false) AS warning_count
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       LEFT JOIN salary_structures s ON s.id = ps.structure_id
       LEFT JOIN payruns p ON p.id = ps.payrun_id
       ${where}
       ORDER BY ps.created_at DESC`,
      params
    );
    return sendSuccess(res, rows.map((r) => ({ ...r, warning_count: Number(r.warning_count) })));
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

// ─── GET /api/payslips/:id/compare?with=<payslipId> ────────────────────────────────────────────
// Tier-2 "Why did my salary change?" (CLAUDE.md): pure read-side diff of two real payslips'
// already-computed `payslip_lines` for one employee — no recomputation, no second calculation
// path, just comparing data the engine already produced.

async function compare(req, res, next) {
  try {
    const otherId = req.query.with;
    if (!otherId) { const e = new Error('Query param "with" (the other payslip id) is required'); e.statusCode = 422; throw e; }
    if (otherId === req.params.id) { const e = new Error('Cannot compare a payslip with itself'); e.statusCode = 422; throw e; }

    const { rows } = await pool.query(
      `SELECT ps.id, ps.employee_id, ps.period_start, ps.period_end, ps.status,
              e.first_name, e.last_name, s.name AS structure_name
       FROM payslips ps
       JOIN employees e ON e.id = ps.employee_id
       LEFT JOIN salary_structures s ON s.id = ps.structure_id
       WHERE ps.id = ANY($1::uuid[])`,
      [[req.params.id, otherId]]
    );
    const a = rows.find((r) => r.id === req.params.id);
    const b = rows.find((r) => r.id === otherId);
    if (!a || !b) { const e = new Error('One or both payslips were not found'); e.statusCode = 404; throw e; }

    // Same ownership rule as every other payslip route — checking `a` is enough once we've
    // confirmed both rows belong to the same employee, checked next.
    assertOwnRecordOrPayroll(req, a.employee_id);
    if (a.employee_id !== b.employee_id) {
      const e = new Error('Can only compare two payslips belonging to the same employee'); e.statusCode = 422; throw e;
    }

    // Chronological order (by period), not URL param order, so the diff always reads "earlier -> later".
    const [from, to] = new Date(a.period_start) <= new Date(b.period_start) ? [a, b] : [b, a];

    const { rows: allLines } = await pool.query(
      `SELECT payslip_id, code, name, category, sequence, amount
       FROM payslip_lines WHERE payslip_id = ANY($1::uuid[])`,
      [[from.id, to.id]]
    );
    const fromLines = new Map(allLines.filter((l) => l.payslip_id === from.id).map((l) => [l.code, l]));
    const toLines = new Map(allLines.filter((l) => l.payslip_id === to.id).map((l) => [l.code, l]));

    const codes = [...new Set([...fromLines.keys(), ...toLines.keys()])];
    // Stable order: by whichever side has the rule's real sequence, falling back to the other side.
    codes.sort((x, y) => {
      const sx = fromLines.get(x)?.sequence ?? toLines.get(x)?.sequence ?? 0;
      const sy = fromLines.get(y)?.sequence ?? toLines.get(y)?.sequence ?? 0;
      return sx - sy;
    });

    const diff = codes.map((code) => {
      const fromLine = fromLines.get(code);
      const toLine = toLines.get(code);
      const fromAmount = fromLine ? Number(fromLine.amount) : 0;
      const toAmount = toLine ? Number(toLine.amount) : 0;
      const delta = Math.round((toAmount - fromAmount) * 100) / 100;
      const status = !fromLine ? 'added' : !toLine ? 'removed' : delta === 0 ? 'unchanged' : delta > 0 ? 'increased' : 'decreased';
      return {
        code,
        name: (toLine ?? fromLine).name,
        category: (toLine ?? fromLine).category,
        from_amount: fromAmount,
        to_amount: toAmount,
        delta,
        status,
      };
    });

    return sendSuccess(res, {
      employee: { id: a.employee_id, first_name: a.first_name, last_name: a.last_name },
      from: { id: from.id, period_start: from.period_start, period_end: from.period_end, structure_name: from.structure_name },
      to: { id: to.id, period_start: to.period_start, period_end: to.period_end, structure_name: to.structure_name },
      diff,
    });
  } catch (err) { next(err); }
}

module.exports = { list, getById, getPdf, compare };
