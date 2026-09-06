'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const ROLES = ['employee', 'hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

// ─── GET /api/users — admin-only, PS §3: "User management, role assignment" ────────────────────

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, u.employee_id, u.is_active, u.created_at,
              e.first_name AS employee_first_name, e.last_name AS employee_last_name
       FROM users u
       LEFT JOIN employees e ON e.id = u.employee_id
       ORDER BY u.created_at DESC`
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── PATCH /api/users/:id — admin-only, update role and/or link to an employee record ──────────

async function update(req, res, next) {
  try {
    const { role, employee_id, is_active } = req.body;
    const sets = [];
    const params = [req.params.id];

    if (is_active !== undefined) {
      params.push(!!is_active);
      sets.push(`is_active = $${params.length}`);
    }

    if (role !== undefined) {
      if (!ROLES.includes(role)) {
        const e = new Error(`role must be one of: ${ROLES.join(', ')}`); e.statusCode = 422; throw e;
      }
      params.push(role);
      sets.push(`role = $${params.length}`);
    }

    if (employee_id !== undefined) {
      if (employee_id !== null) {
        const { rows: empRows } = await pool.query(`SELECT id FROM employees WHERE id = $1`, [employee_id]);
        if (!empRows[0]) { const e = new Error('Employee not found'); e.statusCode = 404; throw e; }
      }
      params.push(employee_id);
      sets.push(`employee_id = $${params.length}`);
    }

    if (sets.length === 0) { const e = new Error('No updatable fields provided'); e.statusCode = 422; throw e; }

    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(', ')}, updated_at = now() WHERE id = $1
       RETURNING id, email, role, employee_id, is_active`,
      params
    );
    if (!rows[0]) { const e = new Error('User not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      err.message = 'This employee is already linked to another user account';
      err.statusCode = 409;
    }
    next(err);
  }
}

module.exports = { list, update };
