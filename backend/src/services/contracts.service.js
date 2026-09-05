'use strict';

const pool = require('../db/pool');

/**
 * Resolve the contract applicable to a given payroll period for an employee.
 * DB_GUIDE.md "Real Key-Join Patterns #1". The no_overlapping_active_contracts exclusion
 * constraint on `contracts` guarantees at most one row can ever match — LIMIT 1 here is a
 * safety net, not a substitute for that guarantee.
 *
 * @param {import('pg').PoolClient} [client] — pass the transaction client when called from
 *   inside computePayslip's transaction; defaults to the shared pool for standalone reads.
 */
async function resolveApplicableContract(employeeId, periodStart, periodEnd, client = pool) {
  const { rows } = await client.query(
    `SELECT id, employee_id, wage, salary_structure_id, position, date_start, date_end
     FROM contracts
     WHERE employee_id = $1
       AND status = 'active'
       AND date_range && daterange($2::date, $3::date, '[]')
     LIMIT 1`,
    [employeeId, periodStart, periodEnd]
  );
  return rows[0] || null;
}

/**
 * All employees eligible for a payrun over the given period — used by the wizard's
 * step 1→2 transition (POST /api/payruns/draft) to show real, live eligibility instead of a
 * static employee list. "Eligible" = active employee; `has_contract` tells the UI which ones
 * will actually produce a payslip vs. surface a contract_missing warning.
 */
async function listEligibleEmployees(periodStart, periodEnd) {
  const { rows } = await pool.query(
    `SELECT
       e.id, e.employee_code, e.first_name, e.last_name, e.department_id, e.employee_type,
       (c.id IS NOT NULL) AS has_contract,
       (e.bank_account_number IS NOT NULL AND e.bank_account_number <> '') AS has_bank_details
     FROM employees e
     LEFT JOIN contracts c
       ON c.employee_id = e.id
      AND c.status = 'active'
      AND c.date_range && daterange($1::date, $2::date, '[]')
     WHERE e.status = 'active'
     ORDER BY e.last_name, e.first_name`,
    [periodStart, periodEnd]
  );
  return rows;
}

module.exports = { resolveApplicableContract, listEligibleEmployees };
