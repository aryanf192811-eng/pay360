'use strict';

const { evaluate } = require('mathjs');
const pool = require('../db/pool');
const logger = require('../utils/logger');

/**
 * The real dynamic-calculation core (CLAUDE.md's Dynamic Data Mandate — no hardcoded numbers
 * anywhere). See DB_GUIDE.md's Ledger Pattern for why payslip_lines is the only place a
 * payslip's Basic/Allowances/Deductions/Gross/Net ever live — `payslips` itself has no such
 * column to drift out of sync.
 *
 * Salary rule formulas are user-editable data (an HR Payroll Manager writes them via the Salary
 * Rules screen). They are evaluated with mathjs's `evaluate(expr, scope)` — a sandboxed
 * expression parser with no access to Node globals, `require`, or the filesystem — NEVER with
 * `eval()` or `new Function()`, either of which would turn an editable database field into
 * arbitrary server-side code execution.
 */

async function insertWarning(client, { payslipId = null, payrunId = null, type, message }) {
  await client.query(
    `INSERT INTO payroll_warnings (payslip_id, payrun_id, warning_type, message)
     VALUES ($1, $2, $3, $4)`,
    [payslipId, payrunId, type, message]
  );
}

/**
 * Count distinct calendar days with real attendance in the period. Kept as a direct count
 * (not schedule-weighted) — "worked days" on a payslip is literally how many days the employee
 * showed up, not an attendance-rate percentage; that distinction matters for the Payroll
 * Dashboard's Attendance Health metric (a different, schedule-aware calculation), not here.
 */
async function computeWorkedDays(client, employeeId, periodStart, periodEnd) {
  const { rows } = await client.query(
    `SELECT COUNT(DISTINCT check_in::date)::int AS worked_days
     FROM attendances
     WHERE employee_id = $1
       AND check_in::date BETWEEN $2::date AND $3::date
       AND status IN ('present', 'late', 'overtime')`,
    [employeeId, periodStart, periodEnd]
  );
  return rows[0].worked_days;
}

/**
 * Time Off -> Payroll integration (PS Project Overview: "leave balances depend on allocations
 * and approved requests, and payroll must transform all of that into understandable payslips" —
 * this is the line that actually does that transformation; without it, approved leave has zero
 * effect on pay, which contradicts the PS's own stated thesis).
 *
 * Splits APPROVED leave overlapping the period by each type's `payroll_integrated` flag:
 *   - payroll_integrated = true  -> paid leave: added to WORKED_DAYS, so the employee is paid
 *     as if present (sick/annual leave doesn't cost them pay).
 *   - payroll_integrated = false -> unpaid leave: NOT added to WORKED_DAYS, exposed separately
 *     as UNPAID_LEAVE_DAYS so a Salary Rule can reference it in a formula (e.g. a proportional
 *     deduction) if the structure designer wants one. The engine deliberately does not hardcode
 *     a proration formula itself — per DB_GUIDE.md/CLAUDE.md, "flexible computation methods...
 *     drive the actual salary calculations," meaning this stays configurable via Salary Rules,
 *     not baked into the engine.
 * Uses date-range overlap (not exact period containment) so a leave request spanning across a
 * period boundary still counts for the days that actually fall inside this period.
 */
async function computeLeaveDays(client, employeeId, periodStart, periodEnd) {
  const { rows } = await client.query(
    `SELECT
       COALESCE(SUM(r.duration) FILTER (WHERE t.payroll_integrated = true), 0) AS paid_leave_days,
       COALESCE(SUM(r.duration) FILTER (WHERE t.payroll_integrated = false), 0) AS unpaid_leave_days
     FROM time_off_requests r
     JOIN time_off_types t ON t.id = r.time_off_type_id
     WHERE r.employee_id = $1
       AND r.status = 'approved'
       AND r.date_from <= $3::date
       AND r.date_to >= $2::date`,
    [employeeId, periodStart, periodEnd]
  );
  return {
    paidLeaveDays: Number(rows[0].paid_leave_days),
    unpaidLeaveDays: Number(rows[0].unpaid_leave_days),
  };
}

/**
 * Compute (or idempotently recompute) one payslip. Fully transactional: wipes any prior
 * `payslip_lines`/`payroll_warnings` for this payslip and rebuilds both from scratch inside a
 * single BEGIN/COMMIT — a recompute never leaves the payslip in a half-old/half-new state.
 *
 * Returns { payslipId, computed, reason?, netAmount? }.
 */
async function computePayslip(payslipId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: slipRows } = await client.query(
      `SELECT id, payrun_id, employee_id, period_start, period_end
       FROM payslips WHERE id = $1 FOR UPDATE`,
      [payslipId]
    );
    if (!slipRows[0]) {
      const e = new Error('Payslip not found');
      e.statusCode = 404;
      throw e;
    }
    const slip = slipRows[0];

    // Idempotent recompute: clear this payslip's prior lines and prior warnings before rebuilding.
    await client.query(`DELETE FROM payslip_lines WHERE payslip_id = $1`, [payslipId]);
    await client.query(`DELETE FROM payroll_warnings WHERE payslip_id = $1`, [payslipId]);

    // Missing bank details is checked regardless of contract status — HR needs to know either way.
    const { rows: empRows } = await client.query(
      `SELECT bank_account_number FROM employees WHERE id = $1`,
      [slip.employee_id]
    );
    if (!empRows[0]?.bank_account_number) {
      await insertWarning(client, {
        payslipId,
        type: 'missing_bank_details',
        message: 'Employee has no bank account number on file',
      });
    }

    // Resolve the applicable contract (DB_GUIDE.md Real Key-Join Pattern #1) — inline here
    // rather than via contracts.service so it shares this transaction's client/lock.
    const { rows: contractRows } = await client.query(
      `SELECT id, wage, salary_structure_id
       FROM contracts
       WHERE employee_id = $1
         AND status = 'active'
         AND date_range && daterange($2::date, $3::date, '[]')
       LIMIT 1`,
      [slip.employee_id, slip.period_start, slip.period_end]
    );
    const contract = contractRows[0];

    if (!contract) {
      await insertWarning(client, {
        payslipId,
        payrunId: slip.payrun_id,
        type: 'contract_missing',
        message: 'No active contract covers this payslip\'s period',
      });
      await client.query(
        `UPDATE payslips SET status = 'computed', contract_id = NULL, worked_days = NULL, updated_at = now()
         WHERE id = $1`,
        [payslipId]
      );
      await client.query('COMMIT');
      logger.info({ payslipId }, 'payslip compute: contract_missing, no lines generated');
      return { payslipId, computed: false, reason: 'contract_missing' };
    }

    const attendanceWorkedDays = await computeWorkedDays(client, slip.employee_id, slip.period_start, slip.period_end);
    const { paidLeaveDays, unpaidLeaveDays } = await computeLeaveDays(client, slip.employee_id, slip.period_start, slip.period_end);
    // Paid leave counts toward worked days (employee is paid as if present); unpaid leave does
    // not, and is exposed separately for a Salary Rule to act on if the structure wants to.
    const workedDays = attendanceWorkedDays + paidLeaveDays;
    const periodDays = Math.round((new Date(slip.period_end) - new Date(slip.period_start)) / 86400000) + 1;

    const { rows: rules } = await client.query(
      `SELECT id, code, name, category, sequence, computation_method, amount, percentage, base_code, formula
       FROM salary_rules
       WHERE structure_id = $1 AND active = true
       ORDER BY sequence ASC`,
      [contract.salary_structure_id]
    );

    // Running context: rule codes become variables later rules can reference. Seeded only from
    // real data (contract wage, attendance, and approved leave) — never a hardcoded starting
    // value. UNPAID_LEAVE_DAYS/PERIOD_DAYS exist so a Salary Rule formula can implement its own
    // proration (e.g. "BASIC - (BASIC / PERIOD_DAYS) * UNPAID_LEAVE_DAYS") without the engine
    // hardcoding that policy itself.
    const context = {
      BASIC: Number(contract.wage),
      WORKED_DAYS: workedDays,
      UNPAID_LEAVE_DAYS: unpaidLeaveDays,
      PERIOD_DAYS: periodDays,
    };
    const lines = [];

    for (const rule of rules) {
      let amount;
      if (rule.computation_method === 'fixed') {
        amount = Number(rule.amount);
      } else if (rule.computation_method === 'percentage') {
        const base = context[rule.base_code];
        if (base === undefined) {
          throw new Error(
            `Salary rule "${rule.code}" (percentage) references base_code "${rule.base_code}", ` +
            `which hasn't been computed yet — check rule sequence ordering`
          );
        }
        amount = base * (Number(rule.percentage) / 100);
      } else if (rule.computation_method === 'formula') {
        // Sandboxed expression evaluation only — see file header comment.
        amount = evaluate(rule.formula, { ...context });
        if (typeof amount !== 'number' || !Number.isFinite(amount)) {
          throw new Error(`Salary rule "${rule.code}" formula did not evaluate to a finite number`);
        }
      } else {
        throw new Error(`Unknown computation_method "${rule.computation_method}" on rule ${rule.code}`);
      }

      amount = Math.round(amount * 100) / 100;
      context[rule.code] = amount;
      lines.push({
        salary_rule_id: rule.id,
        code: rule.code,
        name: rule.name,
        category: rule.category,
        sequence: rule.sequence,
        amount,
      });
    }

    for (const line of lines) {
      await client.query(
        `INSERT INTO payslip_lines (payslip_id, salary_rule_id, code, name, category, sequence, amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [payslipId, line.salary_rule_id, line.code, line.name, line.category, line.sequence, line.amount]
      );
    }

    const netLine = [...lines].reverse().find((l) => l.category === 'net');
    if (netLine && netLine.amount < 0) {
      await insertWarning(client, {
        payslipId,
        payrunId: slip.payrun_id,
        type: 'negative_net',
        message: `Computed net pay is negative (${netLine.amount})`,
      });
    }

    await client.query(
      `UPDATE payslips SET status = 'computed', contract_id = $2, worked_days = $3, updated_at = now()
       WHERE id = $1`,
      [payslipId, contract.id, workedDays]
    );

    await client.query('COMMIT');
    logger.info({ payslipId, net: netLine?.amount }, 'payslip computed');
    return { payslipId, computed: true, netAmount: netLine ? netLine.amount : null };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Compute every payslip under a payrun; returns the per-payslip results array. */
async function computePayrun(payrunId) {
  const { rows: payslips } = await pool.query(`SELECT id FROM payslips WHERE payrun_id = $1`, [payrunId]);
  const results = [];
  for (const p of payslips) {
    results.push(await computePayslip(p.id));
  }
  return results;
}

module.exports = { computeWorkedDays, computePayslip, computePayrun };
