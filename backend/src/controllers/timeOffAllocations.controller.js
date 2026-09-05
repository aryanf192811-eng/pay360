'use strict';

const pool = require('../db/pool');
const { getAllocationBalance, approveAllocation } = require('../services/timeOff.service');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

// ─── GET /api/time-off-allocations?employee_id= ───────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { employee_id } = req.query;
    const params = [];
    let where = '';
    if (employee_id) { params.push(employee_id); where = `WHERE a.employee_id = $1`; }

    const { rows } = await pool.query(
      `SELECT a.id, a.employee_id, a.time_off_type_id, a.allocated, a.valid_from, a.valid_to,
              a.status, a.approved_by, a.created_at
       FROM time_off_allocations a
       ${where}
       ORDER BY a.created_at DESC`,
      params
    );

    // Live taken/remaining per row — never a stored/cached value (Ledger Pattern, DB_GUIDE.md).
    const withBalance = await Promise.all(
      rows.map(async (row) => {
        const balance = await getAllocationBalance(row.id);
        return { ...row, taken: balance.taken, remaining: balance.remaining };
      })
    );

    return sendSuccess(res, withBalance);
  } catch (err) { next(err); }
}

// ─── GET /api/time-off-allocations/:id ─────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, employee_id, time_off_type_id, allocated, valid_from, valid_to, status, approved_by, created_at
       FROM time_off_allocations WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Allocation not found'); e.statusCode = 404; throw e; }

    const balance = await getAllocationBalance(req.params.id);
    return sendSuccess(res, { ...rows[0], taken: balance.taken, remaining: balance.remaining });
  } catch (err) { next(err); }
}

// ─── POST /api/time-off-allocations ────────────────────────────────────────────────────────────

async function create(req, res, next) {
  try {
    const { employee_id, time_off_type_id, allocated, valid_from, valid_to } = req.body;

    if (!employee_id || !time_off_type_id) {
      const e = new Error('employee_id and time_off_type_id are required'); e.statusCode = 422; throw e;
    }
    if (allocated === undefined || Number(allocated) < 0) {
      const e = new Error('allocated must be a non-negative number'); e.statusCode = 422; throw e;
    }
    if (!valid_from) {
      const e = new Error('valid_from is required'); e.statusCode = 422; throw e;
    }

    const { rows } = await pool.query(
      `INSERT INTO time_off_allocations (employee_id, time_off_type_id, allocated, valid_from, valid_to, status)
       VALUES ($1, $2, $3, $4, $5, 'draft')
       RETURNING id, employee_id, time_off_type_id, allocated, valid_from, valid_to, status, created_at`,
      [employee_id, time_off_type_id, allocated, valid_from, valid_to || null]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) { next(err); }
}

// ─── POST /api/time-off-allocations/:id/approve ────────────────────────────────────────────────

async function approve(req, res, next) {
  try {
    const result = await approveAllocation(req.params.id, req.user.id);
    logger.info({ allocationId: req.params.id, approvedBy: req.user.id }, 'allocation approved');
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, approve };
