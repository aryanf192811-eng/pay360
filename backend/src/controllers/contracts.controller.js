'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');
const { logAudit } = require('../utils/audit');

const STATUSES = ['draft', 'active', 'expired', 'cancelled'];

// ─── GET /api/contracts?employee_id= ───────────────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { employee_id } = req.query;
    const params = [];
    let where = '';
    if (employee_id) { params.push(employee_id); where = `WHERE c.employee_id = $1`; }

    const { rows } = await pool.query(
      `SELECT c.id, c.employee_id, c.department_id, c.position, c.wage, c.salary_structure_id,
              c.date_start, c.date_end, c.status, c.created_at,
              (c.date_range @> CURRENT_DATE) AS is_active_for_today,
              e.first_name, e.last_name
       FROM contracts c
       JOIN employees e ON e.id = c.employee_id
       ${where}
       ORDER BY c.date_start DESC`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── GET /api/contracts/:id ─────────────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, employee_id, department_id, position, wage, salary_structure_id,
              date_start, date_end, status, (date_range @> CURRENT_DATE) AS is_active_for_today, created_at
       FROM contracts WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Contract not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

// ─── POST /api/contracts ───────────────────────────────────────────────────────────────────────

async function create(req, res, next) {
  try {
    const { employee_id, department_id, position, wage, salary_structure_id, date_start, date_end, status = 'draft' } = req.body;

    if (!employee_id) { const e = new Error('employee_id is required'); e.statusCode = 422; throw e; }
    if (wage === undefined || Number(wage) < 0) { const e = new Error('wage must be a non-negative number'); e.statusCode = 422; throw e; }
    if (!date_start) { const e = new Error('date_start is required'); e.statusCode = 422; throw e; }
    if (date_end && new Date(date_end) < new Date(date_start)) {
      const e = new Error('date_end must not be before date_start'); e.statusCode = 422; throw e;
    }
    if (!STATUSES.includes(status)) { const e = new Error(`status must be one of: ${STATUSES.join(', ')}`); e.statusCode = 422; throw e; }

    const { rows } = await pool.query(
      `INSERT INTO contracts (employee_id, department_id, position, wage, salary_structure_id, date_start, date_end, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, employee_id, department_id, position, wage, salary_structure_id, date_start, date_end, status, created_at`,
      [employee_id, department_id || null, position || null, wage, salary_structure_id || null, date_start, date_end || null, status]
    );
    await logAudit(pool, {
      tableName: 'contracts',
      recordId: rows[0].id,
      userId: req.user.id,
      action: 'create',
      changedFields: { employee_id, wage, salary_structure_id: salary_structure_id || null, date_start, date_end: date_end || null, status },
    });
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23P01') {
      err.message = 'This employee already has an active contract whose dates overlap this one — end or cancel the existing contract first';
      err.statusCode = 409;
    } else if (err.code === '23503') {
      err.message = err.constraint === 'contracts_salary_structure_id_fkey'
        ? 'salary_structure_id does not refer to a real salary structure'
        : 'employee_id does not refer to a real employee';
      err.statusCode = 404;
    }
    next(err);
  }
}

// ─── PATCH /api/contracts/:id ───────────────────────────────────────────────────────────────────

// Fields that describe "what this contract's terms actually were" — once any payslip has been
// computed against this contract, editing these in place would silently rewrite history (the
// PS: "Maintain historical contract records... to track changes over time"). The correct way to
// change wage/dates after payslips exist is a NEW contract row (DB_GUIDE.md's effective-dated
// pattern) — end this one via `status`/`date_end` and create the replacement, don't mutate it.
//
// `date_end` is deliberately NOT in this list: shortening a contract's *future* coverage never
// rewrites any past payslip's frozen `payslip_lines` (those already exist independently of what
// this row says now) — it only changes which contract governs periods that haven't been computed
// yet. It IS still guarded, just differently: below, we block moving date_end earlier than the
// latest period_end this contract has already been computed for, so a real historical payslip
// can never be silently orphaned into "contract_missing" on a future recompute.
const HISTORY_SENSITIVE_FIELDS = ['wage', 'date_start', 'salary_structure_id'];

async function update(req, res, next) {
  try {
    const fields = ['department_id', 'position', 'wage', 'salary_structure_id', 'date_start', 'date_end', 'status'];
    const requestedHistorySensitive = HISTORY_SENSITIVE_FIELDS.filter((f) => req.body[f] !== undefined);

    if (requestedHistorySensitive.length > 0) {
      const { rows: usedRows } = await pool.query(
        `SELECT 1 FROM payslips WHERE contract_id = $1 LIMIT 1`,
        [req.params.id]
      );
      if (usedRows[0]) {
        const e = new Error(
          `This contract has already been used to compute at least one payslip — its terms are ` +
          `historical record and can't be edited (attempted: ${requestedHistorySensitive.join(', ')}). ` +
          `End this contract (set date_end) and create a new contract for the changed terms.`
        );
        e.statusCode = 409;
        throw e;
      }
    }

    if (req.body.date_end !== undefined && req.body.date_end !== null) {
      const { rows: latestRows } = await pool.query(
        `SELECT MAX(period_end) AS latest_period_end FROM payslips WHERE contract_id = $1`,
        [req.params.id]
      );
      const latestPeriodEnd = latestRows[0].latest_period_end;
      if (latestPeriodEnd && new Date(req.body.date_end) < new Date(latestPeriodEnd)) {
        const e = new Error(
          `Cannot set date_end to ${req.body.date_end} — this contract has already been used to compute ` +
          `a payslip through ${latestPeriodEnd.toISOString().slice(0, 10)}; date_end must not be earlier than that.`
        );
        e.statusCode = 409;
        throw e;
      }

      const effectiveDateStart = req.body.date_start ?? (
        await pool.query(`SELECT date_start FROM contracts WHERE id = $1`, [req.params.id])
      ).rows[0]?.date_start;
      if (effectiveDateStart && new Date(req.body.date_end) < new Date(effectiveDateStart)) {
        const e = new Error('date_end must not be before date_start'); e.statusCode = 422; throw e;
      }
    }

    const sets = [];
    const params = [req.params.id];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (field === 'status' && !STATUSES.includes(req.body[field])) {
          const e = new Error(`status must be one of: ${STATUSES.join(', ')}`); e.statusCode = 422; throw e;
        }
        if (field === 'wage' && Number(req.body[field]) < 0) {
          const e = new Error('wage must be a non-negative number'); e.statusCode = 422; throw e;
        }
        params.push(req.body[field]);
        sets.push(`${field} = $${params.length}`);
      }
    }
    if (sets.length === 0) { const e = new Error('No updatable fields provided'); e.statusCode = 422; throw e; }

    const { rows: beforeRows } = await pool.query(`SELECT status FROM contracts WHERE id = $1`, [req.params.id]);
    const previousStatus = beforeRows[0]?.status;

    const { rows } = await pool.query(
      `UPDATE contracts SET ${sets.join(', ')}, updated_at = now() WHERE id = $1
       RETURNING id, employee_id, department_id, position, wage, salary_structure_id, date_start, date_end, status`,
      params
    );
    if (!rows[0]) { const e = new Error('Contract not found'); e.statusCode = 404; throw e; }

    // A status change gets its own audit action even if bundled with other fields in one
    // request — "this contract was ended/reactivated" is a distinct historical fact from "the
    // position label was edited", and the Audit Timeline should be able to tell them apart.
    if (req.body.status !== undefined && req.body.status !== previousStatus) {
      await logAudit(pool, {
        tableName: 'contracts', recordId: rows[0].id, userId: req.user.id, action: 'status_change',
        changedFields: { from: previousStatus, to: rows[0].status },
      });
    }
    const nonStatusFields = Object.fromEntries(Object.entries(req.body).filter(([k]) => fields.includes(k) && k !== 'status'));
    if (Object.keys(nonStatusFields).length > 0) {
      await logAudit(pool, {
        tableName: 'contracts', recordId: rows[0].id, userId: req.user.id, action: 'update',
        changedFields: nonStatusFields,
      });
    }

    return sendSuccess(res, rows[0]);
  } catch (err) {
    if (err.code === '23P01') {
      err.message = 'This change would create overlapping active contracts for this employee';
      err.statusCode = 409;
    }
    next(err);
  }
}

module.exports = { list, getById, create, update };
