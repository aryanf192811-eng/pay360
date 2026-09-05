'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const STATUSES = ['present', 'late', 'absent', 'overtime', 'missing_checkout'];

function assertOwnRecordOrHr(req, employeeId) {
  if (req.user.role === 'employee' && req.user.employee_id !== employeeId) {
    const e = new Error('Employees may only access their own attendance records'); e.statusCode = 403; throw e;
  }
}

// ─── GET /api/attendances?employee_id=&status= ────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { employee_id, status } = req.query;
    const conditions = [];
    const params = [];

    if (req.user.role === 'employee') {
      params.push(req.user.employee_id);
      conditions.push(`a.employee_id = $${params.length}`);
    } else if (employee_id) {
      params.push(employee_id);
      conditions.push(`a.employee_id = $${params.length}`);
    }
    if (status) { params.push(status); conditions.push(`a.status = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT a.id, a.employee_id, a.check_in, a.check_out, a.worked_hours, a.status,
              a.is_manual_correction, a.corrected_by, a.notes, a.created_at,
              e.first_name, e.last_name
       FROM attendances a
       JOIN employees e ON e.id = a.employee_id
       ${where}
       ORDER BY a.check_in DESC`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── GET /api/attendances/:id ────────────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, employee_id, check_in, check_out, worked_hours, status, is_manual_correction, corrected_by, notes
       FROM attendances WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Attendance record not found'); e.statusCode = 404; throw e; }
    assertOwnRecordOrHr(req, rows[0].employee_id);
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

// ─── POST /api/attendances — check-in, or check-out if an open entry exists ───────────────────

async function create(req, res, next) {
  try {
    let { employee_id, check_in, status = 'present' } = req.body;

    if (req.user.role === 'employee') {
      employee_id = req.user.employee_id;
    } else if (!employee_id) {
      const e = new Error('employee_id is required'); e.statusCode = 422; throw e;
    }
    if (!STATUSES.includes(status)) {
      const e = new Error(`status must be one of: ${STATUSES.join(', ')}`); e.statusCode = 422; throw e;
    }

    // If this employee already has an open (no check_out) entry, this second POST is really a
    // check-out on that entry — mirrors a real check-in/check-out widget (PS §B3), not two
    // disconnected form submissions.
    const { rows: openRows } = await pool.query(
      `SELECT id FROM attendances WHERE employee_id = $1 AND check_out IS NULL
       ORDER BY check_in DESC LIMIT 1`,
      [employee_id]
    );

    if (openRows[0]) {
      const { rows } = await pool.query(
        `UPDATE attendances SET check_out = now(), updated_at = now() WHERE id = $1
         RETURNING id, employee_id, check_in, check_out, worked_hours, status`,
        [openRows[0].id]
      );
      return sendSuccess(res, rows[0], 200);
    }

    const { rows } = await pool.query(
      `INSERT INTO attendances (employee_id, check_in, status)
       VALUES ($1, COALESCE($2, now()), $3)
       RETURNING id, employee_id, check_in, check_out, worked_hours, status`,
      [employee_id, check_in || null, status]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) { next(err); }
}

// ─── PATCH /api/attendances/:id — manual correction, HR roles only ────────────────────────────

async function update(req, res, next) {
  try {
    const { check_in, check_out, status, notes } = req.body;
    if (status && !STATUSES.includes(status)) {
      const e = new Error(`status must be one of: ${STATUSES.join(', ')}`); e.statusCode = 422; throw e;
    }

    const sets = ['is_manual_correction = true', 'corrected_by = $2', 'updated_at = now()'];
    const params = [req.params.id, req.user.id];

    if (check_in !== undefined) { params.push(check_in); sets.push(`check_in = $${params.length}`); }
    if (check_out !== undefined) { params.push(check_out); sets.push(`check_out = $${params.length}`); }
    if (status !== undefined) { params.push(status); sets.push(`status = $${params.length}`); }
    if (notes !== undefined) { params.push(notes); sets.push(`notes = $${params.length}`); }

    const { rows } = await pool.query(
      `UPDATE attendances SET ${sets.join(', ')} WHERE id = $1
       RETURNING id, employee_id, check_in, check_out, worked_hours, status, is_manual_correction, corrected_by, notes`,
      params
    );
    if (!rows[0]) { const e = new Error('Attendance record not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, update };
