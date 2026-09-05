'use strict';

const ACTIONS = ['create', 'update', 'status_change'];

/**
 * Shared audit-trail writer (CLAUDE.md Tier 2: "Audit timeline UI over audit_logs" — the table
 * existed since the initial schema but nothing ever wrote to it). Accepts either a pool or an
 * in-flight transaction client so callers already inside a BEGIN/COMMIT (payruns, contracts) can
 * log in the same transaction as the change itself — an audit row and its subject change either
 * both commit or both roll back together, never one without the other.
 *
 * `changedFields` should be a plain object of {field: newValue} (or a small descriptive object
 * for status_change, e.g. {from: 'computed', to: 'validated'}) — never the whole row, so a log
 * entry stays a readable diff, not a duplicate copy of the table.
 */
async function logAudit(clientOrPool, { tableName, recordId, userId, action, changedFields }) {
  if (!ACTIONS.includes(action)) {
    throw new Error(`logAudit: action must be one of ${ACTIONS.join(', ')}, got "${action}"`);
  }
  await clientOrPool.query(
    `INSERT INTO audit_logs (table_name, record_id, user_id, action, changed_fields)
     VALUES ($1, $2, $3, $4, $5)`,
    [tableName, recordId, userId || null, action, JSON.stringify(changedFields || {})]
  );
}

module.exports = { logAudit };
