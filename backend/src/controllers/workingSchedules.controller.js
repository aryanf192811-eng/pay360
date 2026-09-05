'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const SCHEDULE_TYPES = ['full_time', 'part_time', 'shift'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function computeTotalWeeklyHours(scheduleId, client = pool) {
  const { rows } = await client.query(
    `SELECT COALESCE(SUM(
       EXTRACT(EPOCH FROM (end_time - start_time)) / 3600.0 - (break_minutes / 60.0)
     ), 0) AS total_hours
     FROM schedule_lines WHERE schedule_id = $1`,
    [scheduleId]
  );
  return Math.round(Number(rows[0].total_hours) * 100) / 100;
}

function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    const e = new Error('lines must be a non-empty array of { day_of_week, start_time, end_time, break_minutes }');
    e.statusCode = 422;
    throw e;
  }
  for (const line of lines) {
    if (typeof line.day_of_week !== 'number' || line.day_of_week < 0 || line.day_of_week > 6) {
      const e = new Error(`Invalid day_of_week "${line.day_of_week}" — must be 0-6`); e.statusCode = 422; throw e;
    }
    if (!line.start_time || !line.end_time) {
      const e = new Error('Each line requires start_time and end_time'); e.statusCode = 422; throw e;
    }
  }
}

// ─── GET /api/working-schedules ────────────────────────────────────────────────────────────────

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, schedule_type, created_at FROM working_schedules ORDER BY name ASC`
    );
    const withHours = await Promise.all(
      rows.map(async (row) => ({ ...row, total_weekly_hours: await computeTotalWeeklyHours(row.id) }))
    );
    return sendSuccess(res, withHours);
  } catch (err) { next(err); }
}

// ─── GET /api/working-schedules/:id ─────────────────────────────────────────────────────────────

async function getById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, schedule_type, created_at FROM working_schedules WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) { const e = new Error('Working schedule not found'); e.statusCode = 404; throw e; }

    const { rows: lines } = await pool.query(
      `SELECT id, day_of_week, start_time, end_time, break_minutes
       FROM schedule_lines WHERE schedule_id = $1 ORDER BY day_of_week ASC`,
      [req.params.id]
    );
    const total_weekly_hours = await computeTotalWeeklyHours(req.params.id);

    return sendSuccess(res, {
      ...rows[0],
      lines: lines.map((l) => ({ ...l, day_name: DAY_NAMES[l.day_of_week] })),
      total_weekly_hours,
    });
  } catch (err) { next(err); }
}

// ─── POST /api/working-schedules ───────────────────────────────────────────────────────────────

async function create(req, res, next) {
  const client = await pool.connect();
  try {
    const { name, schedule_type, lines } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      const e = new Error('name is required'); e.statusCode = 422; throw e;
    }
    if (!SCHEDULE_TYPES.includes(schedule_type)) {
      const e = new Error(`schedule_type must be one of: ${SCHEDULE_TYPES.join(', ')}`); e.statusCode = 422; throw e;
    }
    validateLines(lines);

    await client.query('BEGIN');

    const { rows: schedRows } = await client.query(
      `INSERT INTO working_schedules (name, schedule_type) VALUES ($1, $2)
       RETURNING id, name, schedule_type, created_at`,
      [name.trim(), schedule_type]
    );
    const schedule = schedRows[0];

    for (const line of lines) {
      await client.query(
        `INSERT INTO schedule_lines (schedule_id, day_of_week, start_time, end_time, break_minutes)
         VALUES ($1, $2, $3, $4, $5)`,
        [schedule.id, line.day_of_week, line.start_time, line.end_time, line.break_minutes || 0]
      );
    }

    await client.query('COMMIT');

    // total_weekly_hours is ALWAYS computed server-side from the lines just written —
    // never trusted from the request body, even if the client sent one (Dynamic Data Mandate).
    const total_weekly_hours = await computeTotalWeeklyHours(schedule.id);

    return sendSuccess(res, { ...schedule, total_weekly_hours }, 201);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') { err.message = 'A duplicate day_of_week was provided for this schedule'; err.statusCode = 409; }
    next(err);
  } finally {
    client.release();
  }
}

// ─── PATCH /api/working-schedules/:id — delete-then-insert lines (DB_GUIDE.md pattern) ─────────

async function update(req, res, next) {
  const client = await pool.connect();
  try {
    const { name, schedule_type, lines } = req.body;

    await client.query('BEGIN');

    const { rows: existing } = await client.query(
      `SELECT id FROM working_schedules WHERE id = $1 FOR UPDATE`,
      [req.params.id]
    );
    if (!existing[0]) { const e = new Error('Working schedule not found'); e.statusCode = 404; throw e; }

    if (name || schedule_type) {
      if (schedule_type && !SCHEDULE_TYPES.includes(schedule_type)) {
        const e = new Error(`schedule_type must be one of: ${SCHEDULE_TYPES.join(', ')}`); e.statusCode = 422; throw e;
      }
      await client.query(
        `UPDATE working_schedules SET name = COALESCE($2, name), schedule_type = COALESCE($3, schedule_type)
         WHERE id = $1`,
        [req.params.id, name?.trim() || null, schedule_type || null]
      );
    }

    if (lines) {
      validateLines(lines);
      await client.query(`DELETE FROM schedule_lines WHERE schedule_id = $1`, [req.params.id]);
      for (const line of lines) {
        await client.query(
          `INSERT INTO schedule_lines (schedule_id, day_of_week, start_time, end_time, break_minutes)
           VALUES ($1, $2, $3, $4, $5)`,
          [req.params.id, line.day_of_week, line.start_time, line.end_time, line.break_minutes || 0]
        );
      }
    }

    await client.query('COMMIT');

    const { rows: updated } = await pool.query(
      `SELECT id, name, schedule_type, created_at FROM working_schedules WHERE id = $1`,
      [req.params.id]
    );
    const total_weekly_hours = await computeTotalWeeklyHours(req.params.id);
    return sendSuccess(res, { ...updated[0], total_weekly_hours });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { list, getById, create, update };
