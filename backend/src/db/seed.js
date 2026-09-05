'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./pool');
const logger = require('../utils/logger');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    logger.info('Starting seed script...');

    // 1. Departments
    logger.info('Seeding departments...');
    const depts = ['Engineering', 'Human Resources', 'Sales'];
    const deptIds = {};
    for (const d of depts) {
      const res = await client.query(
        `INSERT INTO departments (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [d]
      );
      deptIds[d] = res.rows[0].id;
    }

    // 2. Working Schedules
    logger.info('Seeding working schedules...');
    const schedules = [
      { name: 'Standard 40h', type: 'full_time' },
      { name: 'Part Time 20h', type: 'part_time' }
    ];
    const schedIds = {};
    for (const s of schedules) {
      // name isn't inherently unique by schema but let's assume it is for seed
      // actually, just check if it exists, or ON CONFLICT (if we had a unique constraint).
      // Since working_schedules doesn't have a unique constraint on name, we select first.
      let res = await client.query(`SELECT id FROM working_schedules WHERE name = $1`, [s.name]);
      if (res.rows.length === 0) {
        res = await client.query(
          `INSERT INTO working_schedules (name, schedule_type) VALUES ($1, $2) RETURNING id`,
          [s.name, s.type]
        );
      }
      schedIds[s.name] = res.rows[0].id;

      // Seed schedule lines if we just created it or even if it exists (delete and recreate lines)
      await client.query(`DELETE FROM schedule_lines WHERE schedule_id = $1`, [schedIds[s.name]]);
      
      if (s.type === 'full_time') {
        // Mon-Fri 09:00 - 17:00, 60m break (7h paid x 5 = 35h or 8h paid = 40h if 09-18)
        // Let's do 09:00 to 18:00 with 60m break = 8h/day
        for (let i = 1; i <= 5; i++) {
          await client.query(
            `INSERT INTO schedule_lines (schedule_id, day_of_week, start_time, end_time, break_minutes)
             VALUES ($1, $2, '09:00', '18:00', 60)`,
            [schedIds[s.name], i]
          );
        }
      } else {
        // Mon-Fri 09:00 - 13:00, 0m break = 4h x 5 = 20h, matching the schedule's own name
        for (let i = 1; i <= 5; i++) {
          await client.query(
            `INSERT INTO schedule_lines (schedule_id, day_of_week, start_time, end_time, break_minutes)
             VALUES ($1, $2, '09:00', '13:00', 0)`,
            [schedIds[s.name], i]
          );
        }
      }
    }

    // 3. Employees
    logger.info('Seeding employees...');
    const employees = [
      { code: 'EMP-001', first: 'Alice', last: 'Admin', email: 'alice.admin@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'admin' },
      { code: 'EMP-002', first: 'Bob', last: 'HR', email: 'bob.hr@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'hr_manager' },
      { code: 'EMP-003', first: 'Charlie', last: 'Payroll', email: 'charlie.payroll@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'hr_payroll_user' },
      { code: 'EMP-004', first: 'Diana', last: 'PayrollMgr', email: 'diana.pm@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'hr_payroll_manager' },
      { code: 'EMP-005', first: 'Eve', last: 'Engineer', email: 'eve.engineer@example.com', dept: 'Engineering', type: 'full_time', sched: 'Standard 40h', role: 'employee' },
      { code: 'EMP-006', first: 'Frank', last: 'Engineer', email: 'frank.engineer@example.com', dept: 'Engineering', type: 'full_time', sched: 'Standard 40h', role: 'employee' },
      { code: 'EMP-007', first: 'Grace', last: 'Sales', email: 'grace.sales@example.com', dept: 'Sales', type: 'full_time', sched: 'Standard 40h', role: 'employee' },
      { code: 'EMP-008', first: 'Heidi', last: 'SalesPT', email: 'heidi.sales@example.com', dept: 'Sales', type: 'part_time', sched: 'Part Time 20h', role: 'employee' },
      { code: 'EMP-009', first: 'Ivan', last: 'Contractor', email: 'ivan.c@example.com', dept: 'Engineering', type: 'contract', sched: 'Standard 40h', role: 'employee' }
    ];

    const passwordHash = await bcrypt.hash('SeedPass1!', 10);
    const empIds = {};

    for (const e of employees) {
      const res = await client.query(
        `INSERT INTO employees (employee_code, first_name, last_name, email, department_id, schedule_id, employee_type, status, hire_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', '2025-01-01')
         ON CONFLICT (employee_code) DO UPDATE SET 
            first_name = EXCLUDED.first_name, 
            last_name = EXCLUDED.last_name, 
            department_id = EXCLUDED.department_id,
            schedule_id = EXCLUDED.schedule_id
         RETURNING id`,
        [e.code, e.first, e.last, e.email, deptIds[e.dept], schedIds[e.sched], e.type]
      );
      empIds[e.code] = res.rows[0].id;

      // Upsert User
      await client.query(
        `INSERT INTO users (email, password_hash, role, employee_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET 
            role = EXCLUDED.role, 
            employee_id = EXCLUDED.employee_id`,
        [e.email, passwordHash, e.role, empIds[e.code]]
      );
    }

    // Assign Manager for some
    await client.query(
      `UPDATE employees SET manager_id = $1 WHERE employee_code IN ('EMP-006', 'EMP-009')`,
      [empIds['EMP-005']] // Eve manages Frank and Ivan
    );

    await client.query('COMMIT');
    logger.info('Seed script completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err }, 'Seed script failed');
    process.exit(1);
  } finally {
    client.release();
  }
}

seed().then(() => {
  pool.end();
});
