'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const UNITS = ['days', 'hours'];

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, unit, requires_allocation, payroll_integrated, created_at
       FROM time_off_types ORDER BY name ASC`
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, unit, requires_allocation = true, payroll_integrated = false } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      const e = new Error('name is required'); e.statusCode = 422; throw e;
    }
    if (!UNITS.includes(unit)) {
      const e = new Error(`unit must be one of: ${UNITS.join(', ')}`); e.statusCode = 422; throw e;
    }

    const { rows } = await pool.query(
      `INSERT INTO time_off_types (name, unit, requires_allocation, payroll_integrated)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, unit, requires_allocation, payroll_integrated, created_at`,
      [name.trim(), unit, !!requires_allocation, !!payroll_integrated]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23505') { err.message = 'A time off type with this name already exists'; err.statusCode = 409; }
    next(err);
  }
}

module.exports = { list, create };
