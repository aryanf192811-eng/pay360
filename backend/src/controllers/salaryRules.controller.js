'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const CATEGORIES = ['basic', 'allowance', 'gross', 'deduction', 'net'];
const METHODS = ['fixed', 'percentage', 'formula'];

async function list(req, res, next) {
  try {
    const { structure_id } = req.query;
    const params = [];
    let where = '';
    if (structure_id) { params.push(structure_id); where = `WHERE structure_id = $1`; }

    const { rows } = await pool.query(
      `SELECT id, structure_id, name, code, category, sequence, computation_method,
              amount, percentage, base_code, formula, active, created_at
       FROM salary_rules ${where} ORDER BY sequence ASC`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

function validateRule(body, { partial = false } = {}) {
  const { category, computation_method, amount, percentage, base_code, formula } = body;

  if (!partial || category !== undefined) {
    if (!CATEGORIES.includes(category)) {
      const e = new Error(`category must be one of: ${CATEGORIES.join(', ')}`); e.statusCode = 422; throw e;
    }
  }
  if (!partial || computation_method !== undefined) {
    if (!METHODS.includes(computation_method)) {
      const e = new Error(`computation_method must be one of: ${METHODS.join(', ')}`); e.statusCode = 422; throw e;
    }
    // Formulas are stored as text ONLY — never evaluated here. The payroll engine
    // (payrollEngine.service.js) is the sole place they're ever evaluated, via mathjs.
    if (computation_method === 'fixed' && (amount === undefined || amount === null)) {
      const e = new Error('amount is required when computation_method is "fixed"'); e.statusCode = 422; throw e;
    }
    if (computation_method === 'percentage' && (percentage === undefined || !base_code)) {
      const e = new Error('percentage and base_code are required when computation_method is "percentage"'); e.statusCode = 422; throw e;
    }
    if (computation_method === 'formula' && !formula) {
      const e = new Error('formula is required when computation_method is "formula"'); e.statusCode = 422; throw e;
    }
  }
}

async function create(req, res, next) {
  try {
    const { structure_id, name, code, category, sequence = 10, computation_method, amount, percentage, base_code, formula, active = true } = req.body;

    if (!structure_id) { const e = new Error('structure_id is required'); e.statusCode = 422; throw e; }
    if (!name || !code) { const e = new Error('name and code are required'); e.statusCode = 422; throw e; }
    validateRule(req.body);

    const { rows } = await pool.query(
      `INSERT INTO salary_rules (structure_id, name, code, category, sequence, computation_method, amount, percentage, base_code, formula, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, structure_id, name, code, category, sequence, computation_method, amount, percentage, base_code, formula, active, created_at`,
      [structure_id, name, code.trim().toUpperCase(), category, sequence, computation_method,
       amount ?? null, percentage ?? null, base_code || null, formula || null, !!active]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23505') { err.message = 'A rule with this code already exists in this structure'; err.statusCode = 409; }
    next(err);
  }
}

async function update(req, res, next) {
  try {
    validateRule(req.body, { partial: true });

    const fields = ['name', 'category', 'sequence', 'computation_method', 'amount', 'percentage', 'base_code', 'formula', 'active'];
    const sets = [];
    const params = [req.params.id];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        params.push(req.body[field]);
        sets.push(`${field} = $${params.length}`);
      }
    }
    if (sets.length === 0) { const e = new Error('No updatable fields provided'); e.statusCode = 422; throw e; }

    const { rows } = await pool.query(
      `UPDATE salary_rules SET ${sets.join(', ')}, updated_at = now() WHERE id = $1
       RETURNING id, structure_id, name, code, category, sequence, computation_method, amount, percentage, base_code, formula, active`,
      params
    );
    if (!rows[0]) { const e = new Error('Salary rule not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

module.exports = { list, create, update };
