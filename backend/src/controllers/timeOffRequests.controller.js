'use strict';

const pool = require('../db/pool');
const { approveRequest, refuseRequest } = require('../services/timeOff.service');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

const HR_ROLES = ['hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

// ─── GET /api/time-off-requests?employee_id=&status= ──────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { employee_id, status } = req.query;
    const conditions = [];
    const params = [];

    // Employee role only ever sees their own requests, regardless of query params sent —
    // same ownership-in-controller pattern as employees (API_GUIDE.md note on this gap).
    if (req.user.role === 'employee') {
      params.push(req.user.employee_id);
      conditions.push(`r.employee_id = $${params.length}`);
    } else if (employee_id) {
      params.push(employee_id);
      conditions.push(`r.employee_id = $${params.length}`);
    }

    if (status) { params.push(status); conditions.push(`r.status = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT r.id, r.employee_id, r.time_off_type_id, r.allocation_id, r.date_from, r.date_to,
              r.duration, r.status, r.approved_by, r.decided_at, r.created_at,
              e.first_name, e.last_name, t.name AS type_name
       FROM time_off_requests r
       JOIN employees e ON e.id = r.employee_id
       JOIN time_off_types t ON t.id = r.time_off_type_id
       ${where}
       ORDER BY r.created_at DESC`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── GET /api/time-off-requests/:id ────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.employee_id, r.time_off_type_id, r.allocation_id, r.date_from, r.date_to,
              r.duration, r.status, r.approved_by, r.decided_at, r.created_at,
              e.first_name, e.last_name, e.employee_code, t.name AS type_name,
              u.email AS approved_by_email
       FROM time_off_requests r
       JOIN employees e ON e.id = r.employee_id
       JOIN time_off_types t ON t.id = r.time_off_type_id
       LEFT JOIN users u ON u.id = r.approved_by
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Time off request not found'); e.statusCode = 404; throw e; }

    if (req.user.role === 'employee' && req.user.employee_id !== rows[0].employee_id) {
      const e = new Error('Employees may only view their own requests'); e.statusCode = 403; throw e;
    }

    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

// ─── POST /api/time-off-requests ───────────────────────────────────────────────────────────────

async function create(req, res, next) {
  try {
    let { employee_id, time_off_type_id, allocation_id, date_from, date_to, duration } = req.body;

    // Employees may only ever create a request for themselves — role check, not client input.
    if (req.user.role === 'employee') {
      employee_id = req.user.employee_id;
    } else if (!employee_id) {
      const e = new Error('employee_id is required'); e.statusCode = 422; throw e;
    }

    if (!time_off_type_id) { const e = new Error('time_off_type_id is required'); e.statusCode = 422; throw e; }
    if (!date_from || !date_to) { const e = new Error('date_from and date_to are required'); e.statusCode = 422; throw e; }
    if (new Date(date_to) < new Date(date_from)) {
      const e = new Error('date_to must not be before date_from'); e.statusCode = 422; throw e;
    }
    if (duration === undefined || Number(duration) <= 0) {
      const e = new Error('duration must be a positive number'); e.statusCode = 422; throw e;
    }

    // PS §A4: Time Off Types "define... allocation requirements" — enforce it, don't just store
    // the flag. Without this, a type marked requires_allocation could be requested (and later
    // approved) with no allocation_id at all, silently bypassing the entire balance ledger.
    const { rows: typeRows } = await pool.query(
      `SELECT requires_allocation FROM time_off_types WHERE id = $1`,
      [time_off_type_id]
    );
    if (!typeRows[0]) { const e = new Error('Time off type not found'); e.statusCode = 404; throw e; }
    if (typeRows[0].requires_allocation && !allocation_id) {
      const e = new Error('This time off type requires an allocation — allocation_id is required');
      e.statusCode = 422;
      throw e;
    }

    const { rows } = await pool.query(
      `INSERT INTO time_off_requests (employee_id, time_off_type_id, allocation_id, date_from, date_to, duration, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'submitted')
       RETURNING id, employee_id, time_off_type_id, allocation_id, date_from, date_to, duration, status, created_at`,
      [employee_id, time_off_type_id, allocation_id || null, date_from, date_to, duration]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) { next(err); }
}

// ─── POST /api/time-off-requests/:id/approve ───────────────────────────────────────────────────

async function approve(req, res, next) {
  try {
    const result = await approveRequest(req.params.id, req.user.id);
    logger.info({ requestId: req.params.id, approvedBy: req.user.id }, 'time off request approved');
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

// ─── POST /api/time-off-requests/:id/refuse ────────────────────────────────────────────────────

async function refuse(req, res, next) {
  try {
    const result = await refuseRequest(req.params.id, req.user.id);
    logger.info({ requestId: req.params.id, refusedBy: req.user.id }, 'time off request refused');
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

module.exports = { list, getById, create, approve, refuse, HR_ROLES };
