'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

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
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23P01') {
      err.message = 'This employee already has an active contract whose dates overlap this one — end or cancel the existing contract first';
      err.statusCode = 409;
    }
    next(err);
  }
}

// ─── PATCH /api/contracts/:id ───────────────────────────────────────────────────────────────────

async function update(req, res, next) {
  try {
    const fields = ['department_id', 'position', 'wage', 'salary_structure_id', 'date_start', 'date_end', 'status'];
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

    const { rows } = await pool.query(
      `UPDATE contracts SET ${sets.join(', ')}, updated_at = now() WHERE id = $1
       RETURNING id, employee_id, department_id, position, wage, salary_structure_id, date_start, date_end, status`,
      params
    );
    if (!rows[0]) { const e = new Error('Contract not found'); e.statusCode = 404; throw e; }
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
