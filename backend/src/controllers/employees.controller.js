'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contract'];
const STATUSES = ['active', 'inactive'];

function assertOwnRecordOrHr(req, employeeId) {
  if (req.user.role === 'employee' && req.user.employee_id !== employeeId) {
    const e = new Error('Employees may only view their own record'); e.statusCode = 403; throw e;
  }
}

// ─── GET /api/employees?department_id=&status=&employee_type= ────────────────────────────────

async function list(req, res, next) {
  try {
    const { department_id, status, employee_type } = req.query;
    const conditions = [];
    const params = [];

    // An employee-role caller only ever sees themselves, regardless of filters sent.
    if (req.user.role === 'employee') {
      params.push(req.user.employee_id);
      conditions.push(`e.id = $${params.length}`);
    } else {
      if (department_id) { params.push(department_id); conditions.push(`e.department_id = $${params.length}`); }
      if (status) { params.push(status); conditions.push(`e.status = $${params.length}`); }
      if (employee_type) { params.push(employee_type); conditions.push(`e.employee_type = $${params.length}`); }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Smart-button counts computed live via subqueries (DB_GUIDE.md Real Key-Join Pattern #2) —
    // never denormalized/stored columns.
    const { rows } = await pool.query(
      `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
              e.department_id, e.manager_id, e.job_position, e.schedule_id,
              e.employee_type, e.status, e.hire_date, e.bank_account_number,
              d.name AS department_name,
              (SELECT COUNT(*) FROM contracts c WHERE c.employee_id = e.id) AS contract_count,
              (SELECT COUNT(*) FROM time_off_requests r WHERE r.employee_id = e.id AND r.status = 'submitted') AS pending_time_off_count,
              (SELECT COUNT(*) FROM attendances a WHERE a.employee_id = e.id AND a.status IN ('missing_checkout','absent')) AS attendance_exception_count
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       ${where}
       ORDER BY e.last_name, e.first_name`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

// ─── GET /api/employees/:id ─────────────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    assertOwnRecordOrHr(req, req.params.id);

    const { rows } = await pool.query(
      `SELECT e.id, e.employee_code, e.first_name, e.last_name, e.email, e.phone,
              e.department_id, e.manager_id, e.job_position, e.schedule_id,
              e.employee_type, e.status, e.hire_date, e.bank_account_number,
              d.name AS department_name,
              m.first_name AS manager_first_name, m.last_name AS manager_last_name,
              ws.name AS schedule_name,
              (SELECT COUNT(*) FROM contracts c WHERE c.employee_id = e.id) AS contract_count,
              (SELECT COUNT(*) FROM time_off_requests r WHERE r.employee_id = e.id) AS time_off_count,
              (SELECT COUNT(*) FROM attendances a WHERE a.employee_id = e.id) AS attendance_count,
              (SELECT COUNT(*) FROM time_off_allocations al WHERE al.employee_id = e.id) AS allocation_count
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN employees m ON m.id = e.manager_id
       LEFT JOIN working_schedules ws ON ws.id = e.schedule_id
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Employee not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) { next(err); }
}

// ─── POST /api/employees ───────────────────────────────────────────────────────────────────────

async function create(req, res, next) {
  try {
    const {
      first_name, last_name, email, phone, department_id, manager_id,
      job_position, schedule_id, employee_type, status = 'active', hire_date, bank_account_number,
    } = req.body;

    if (!first_name || !last_name) { const e = new Error('first_name and last_name are required'); e.statusCode = 422; throw e; }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const e = new Error('A valid email is required'); e.statusCode = 422; throw e;
    }
    if (!EMPLOYEE_TYPES.includes(employee_type)) {
      const e = new Error(`employee_type must be one of: ${EMPLOYEE_TYPES.join(', ')}`); e.statusCode = 422; throw e;
    }
    if (!STATUSES.includes(status)) {
      const e = new Error(`status must be one of: ${STATUSES.join(', ')}`); e.statusCode = 422; throw e;
    }
    if (!hire_date) { const e = new Error('hire_date is required'); e.statusCode = 422; throw e; }

    // Race-safe sequential code — see migration 1757100000000.
    const { rows: codeRows } = await pool.query(`SELECT 'EMP-' || nextval('employee_code_seq') AS code`);
    const employee_code = codeRows[0].code;

    const { rows } = await pool.query(
      `INSERT INTO employees
         (employee_code, first_name, last_name, email, phone, department_id, manager_id,
          job_position, schedule_id, employee_type, status, hire_date, bank_account_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id, employee_code, first_name, last_name, email, phone, department_id, manager_id,
                 job_position, schedule_id, employee_type, status, hire_date, bank_account_number`,
      [employee_code, first_name, last_name, email.toLowerCase().trim(), phone || null,
       department_id || null, manager_id || null, job_position || null, schedule_id || null,
       employee_type, status, hire_date, bank_account_number || null]
    );
    return sendSuccess(res, rows[0], 201);
  } catch (err) {
    if (err.code === '23505') { err.message = 'An employee with this email already exists'; err.statusCode = 409; }
    next(err);
  }
}

// ─── PATCH /api/employees/:id ───────────────────────────────────────────────────────────────────

async function update(req, res, next) {
  try {
    const fields = [
      'first_name', 'last_name', 'email', 'phone', 'department_id', 'manager_id',
      'job_position', 'schedule_id', 'employee_type', 'status', 'hire_date', 'bank_account_number',
    ];
    const sets = [];
    const params = [req.params.id];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (field === 'employee_type' && !EMPLOYEE_TYPES.includes(req.body[field])) {
          const e = new Error(`employee_type must be one of: ${EMPLOYEE_TYPES.join(', ')}`); e.statusCode = 422; throw e;
        }
        if (field === 'status' && !STATUSES.includes(req.body[field])) {
          const e = new Error(`status must be one of: ${STATUSES.join(', ')}`); e.statusCode = 422; throw e;
        }
        params.push(req.body[field]);
        sets.push(`${field} = $${params.length}`);
      }
    }
    if (sets.length === 0) { const e = new Error('No updatable fields provided'); e.statusCode = 422; throw e; }

    const { rows } = await pool.query(
      `UPDATE employees SET ${sets.join(', ')}, updated_at = now() WHERE id = $1
       RETURNING id, employee_code, first_name, last_name, email, phone, department_id, manager_id,
                 job_position, schedule_id, employee_type, status, hire_date, bank_account_number`,
      params
    );
    if (!rows[0]) { const e = new Error('Employee not found'); e.statusCode = 404; throw e; }
    return sendSuccess(res, rows[0]);
  } catch (err) {
    if (err.code === '23505') { err.message = 'An employee with this email already exists'; err.statusCode = 409; }
    next(err);
  }
}

// ─── Sub-list routes: /:id/contracts /:id/attendances /:id/time-off-requests /:id/allocations ──

async function listContracts(req, res, next) {
  try {
    assertOwnRecordOrHr(req, req.params.id);
    const { rows } = await pool.query(
      `SELECT id, department_id, position, wage, salary_structure_id, date_start, date_end, status,
              (date_range @> CURRENT_DATE) AS is_active_for_today
       FROM contracts WHERE employee_id = $1 ORDER BY date_start DESC`,
      [req.params.id]
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function listAttendances(req, res, next) {
  try {
    assertOwnRecordOrHr(req, req.params.id);
    const { rows } = await pool.query(
      `SELECT id, check_in, check_out, worked_hours, status, is_manual_correction
       FROM attendances WHERE employee_id = $1 ORDER BY check_in DESC`,
      [req.params.id]
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function listTimeOffRequests(req, res, next) {
  try {
    assertOwnRecordOrHr(req, req.params.id);
    const { rows } = await pool.query(
      `SELECT id, time_off_type_id, allocation_id, date_from, date_to, duration, status, decided_at
       FROM time_off_requests WHERE employee_id = $1 ORDER BY created_at DESC`,
      [req.params.id]
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

async function listAllocations(req, res, next) {
  try {
    assertOwnRecordOrHr(req, req.params.id);
    const { rows } = await pool.query(
      `SELECT a.id, a.time_off_type_id, a.allocated, a.valid_from, a.valid_to, a.status,
              COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'approved'), 0) AS taken,
              a.allocated - COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'approved'), 0) AS remaining
       FROM time_off_allocations a
       LEFT JOIN time_off_requests r ON r.allocation_id = a.id
       WHERE a.employee_id = $1
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
      [req.params.id]
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

module.exports = {
  list, getById, create, update,
  listContracts, listAttendances, listTimeOffRequests, listAllocations,
};
