'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT d.id, d.name, d.created_at,
              (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id AND e.status = 'active') AS headcount
       FROM departments d ORDER BY d.name ASC`
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(`SELECT id, name, created_at FROM departments WHERE id = $1`, [req.params.id]);
    if (!rows[0]) { const e = new Error('Department not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      const e = new Error('name is required'); e.statusCode = 422; throw e;
    }
    const { rows } = await pool.query(
      `INSERT INTO departments (name) VALUES ($1) RETURNING id, name, created_at`,
      [name.trim()]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23505') { err.message = 'A department with this name already exists'; err.statusCode = 409; }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      const e = new Error('name is required'); e.statusCode = 422; throw e;
    }
    const { rows } = await pool.query(
      `UPDATE departments SET name = $2 WHERE id = $1 RETURNING id, name, created_at`,
      [req.params.id, name.trim()]
    );
    if (!rows[0]) { const e = new Error('Department not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) {
    if (err.code === '23505') { err.message = 'A department with this name already exists'; err.statusCode = 409; }
    next(err);
  }
}

module.exports = { list, getById, create, update };
