'use strict';

const pool = require('../db/pool');

/**
 * Live balance — DB_GUIDE.md Ledger Pattern. `time_off_allocations` has no taken/remaining
 * column; both are always summed from approved `time_off_requests` at read time.
 */
async function getAllocationBalance(allocationId, client = pool) {
  const { rows } = await client.query(
    `SELECT a.id, a.allocated,
            COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'approved'), 0) AS taken,
            a.allocated - COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'approved'), 0) AS remaining
     FROM time_off_allocations a
     LEFT JOIN time_off_requests r ON r.allocation_id = a.id
     WHERE a.id = $1
     GROUP BY a.id, a.allocated`,
    [allocationId]
  );
  return rows[0] || null;
}

/**
 * Approve a request. Security-baseline "atomic DB-level guard, not read-then-write race":
 * locks the ALLOCATION row (not just the request) before computing the current live balance,
 * so two concurrent approvals against the same allocation are serialized — the second one
 * recomputes the balance after the first commits, rather than both reading a stale figure and
 * both passing the check.
 */
async function approveRequest(requestId, approverId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: reqRows } = await client.query(
      `SELECT id, employee_id, allocation_id, duration, status FROM time_off_requests WHERE id = $1 FOR UPDATE`,
      [requestId]
    );
    if (!reqRows[0]) {
      const e = new Error('Time off request not found'); e.statusCode = 404; throw e;
    }
    const request = reqRows[0];
    if (request.status !== 'submitted') {
      const e = new Error(`Request cannot be approved from status "${request.status}"`); e.statusCode = 409; throw e;
    }

    if (request.allocation_id) {
      // Lock the allocation FIRST — this is what actually serializes concurrent approvers.
      const { rows: allocRows } = await client.query(
        `SELECT id, employee_id, allocated, status FROM time_off_allocations WHERE id = $1 FOR UPDATE`,
        [request.allocation_id]
      );
      if (!allocRows[0]) {
        const e = new Error('Linked allocation not found'); e.statusCode = 404; throw e;
      }
      const allocation = allocRows[0];
      // Real exploit found by audit: nothing previously stopped a request from pointing at a
      // DIFFERENT employee's allocation — approval would then deduct from the wrong person's
      // balance. This must be checked before any balance math, not after.
      if (allocation.employee_id !== request.employee_id) {
        const e = new Error('This allocation does not belong to the request\'s employee');
        e.statusCode = 409;
        throw e;
      }
      if (allocation.status !== 'approved') {
        const e = new Error('Cannot approve a request against an allocation that is not yet approved');
        e.statusCode = 409;
        throw e;
      }

      const { rows: sumRows } = await client.query(
        `SELECT COALESCE(SUM(duration), 0) AS taken
         FROM time_off_requests WHERE allocation_id = $1 AND status = 'approved'`,
        [request.allocation_id]
      );
      const currentTaken = Number(sumRows[0].taken);
      const remaining = Number(allocation.allocated) - currentTaken;

      if (Number(request.duration) > remaining) {
        const shortfall = (Number(request.duration) - remaining).toFixed(2);
        const e = new Error(
          `Approving this request would exceed the allocation by ${shortfall} unit(s) (remaining: ${remaining.toFixed(2)})`
        );
        e.statusCode = 409;
        throw e;
      }
    }

    await client.query(
      `UPDATE time_off_requests
       SET status = 'approved', approved_by = $2, decided_at = now(), updated_at = now()
       WHERE id = $1`,
      [requestId, approverId]
    );

    await client.query('COMMIT');
    return { id: requestId, status: 'approved' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function refuseRequest(requestId, approverId) {
  const { rows } = await pool.query(
    `UPDATE time_off_requests
     SET status = 'refused', approved_by = $2, decided_at = now(), updated_at = now()
     WHERE id = $1 AND status = 'submitted'
     RETURNING id, status`,
    [requestId, approverId]
  );
  if (!rows[0]) {
    const e = new Error('Request not found or already decided'); e.statusCode = 409; throw e;
  }
  return rows[0];
}

/** Allocations require approval before their balance is usable by any request (PS §A4). */
async function approveAllocation(allocationId, approverId) {
  const { rows } = await pool.query(
    `UPDATE time_off_allocations
     SET status = 'approved', approved_by = $2, updated_at = now()
     WHERE id = $1 AND status = 'draft'
     RETURNING id, status`,
    [allocationId, approverId]
  );
  if (!rows[0]) {
    const e = new Error('Allocation not found or already decided'); e.statusCode = 409; throw e;
  }
  return rows[0];
}

module.exports = { getAllocationBalance, approveRequest, refuseRequest, approveAllocation };
