'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

const MAX_LIMIT = 200;

// ─── GET /api/audit-logs?table_name=&record_id=&limit=&before= ────────────────────────────────
// Tier 2 Audit Timeline (CLAUDE.md): read-only over the audit_logs rows now actually written by
// contracts.controller.js / payruns.controller.js. Cursor-paginated on created_at (`before`, an
// ISO timestamp) rather than offset paging, so a page is stable even as new rows keep arriving.

async function list(req, res, next) {
  try {
    const { table_name: tableName, record_id: recordId, before: beforeTs } = req.query;
    let limit = Number(req.query.limit) || 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    if (limit < 1) limit = 1;

    const conditions = [];
    const params = [];
    if (tableName) { params.push(tableName); conditions.push(`a.table_name = $${params.length}`); }
    if (recordId) { params.push(recordId); conditions.push(`a.record_id = $${params.length}`); }
    if (beforeTs) { params.push(beforeTs); conditions.push(`a.created_at < $${params.length}`); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    params.push(limit);
    const { rows } = await pool.query(
      `SELECT a.id, a.table_name, a.record_id, a.action, a.changed_fields, a.created_at,
              u.email AS user_email
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${params.length}`,
      params
    );
    return sendSuccess(res, rows);
  } catch (err) { next(err); }
}

module.exports = { list };
