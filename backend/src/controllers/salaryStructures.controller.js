'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT s.id, s.name, s.active, s.created_at,
              (SELECT COUNT(*) FROM salary_rules r WHERE r.structure_id = s.id) AS rule_count,
              (SELECT COUNT(*) FROM contracts c WHERE c.salary_structure_id = s.id AND c.status = 'active') AS active_employee_count
       FROM salary_structures s
       ORDER BY s.name ASC`
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, active, created_at FROM salary_structures WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Salary structure not found'); e.statusCode = 404; throw e; }

    const { rows: rules } = await pool.query(
      `SELECT id, name, code, category, sequence, computation_method, amount, percentage, base_code, formula, active
       FROM salary_rules WHERE structure_id = $1 ORDER BY sequence ASC`,
      [req.params.id]
    );
    return sendSuccess(res, { ...rows[0], rules });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, active = true } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      const e = new Error('name is required'); e.statusCode = 422; throw e;
    }
    const { rows } = await pool.query(
      `INSERT INTO salary_structures (name, active) VALUES ($1, $2) RETURNING id, name, active, created_at`,
      [name.trim(), !!active]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23505') { err.message = 'A salary structure with this name already exists'; err.statusCode = 409; }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name, active } = req.body;
    const sets = [];
    const params = [req.params.id];
    if (name !== undefined) { params.push(name.trim()); sets.push(`name = $${params.length}`); }
    if (active !== undefined) { params.push(!!active); sets.push(`active = $${params.length}`); }
    if (sets.length === 0) { const e = new Error('No updatable fields provided'); e.statusCode = 422; throw e; }

    const { rows } = await pool.query(
      `UPDATE salary_structures SET ${sets.join(', ')} WHERE id = $1 RETURNING id, name, active, created_at`,
      params
    );
    if (!rows[0]) { const e = new Error('Salary structure not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) {
    if (err.code === '23505') { err.message = 'A salary structure with this name already exists'; err.statusCode = 409; }
    next(err);
  }
}

module.exports = { list, getById, create, update };
