# PeoplePay360 — HR & Payroll

**Odoo Hackathon 2026** submission by Aryan, Naresh, and Parth.

## Problem

HR tools usually store employee details, attendance, leave, and salary as disconnected records.
In reality, payroll needs all of it to agree at once: the right contract for the period, the
schedule that defines expected hours, attendance exceptions that need review, and leave balances
that are actually consumed by approved requests — before a single payslip can be trusted.

## Solution

PeoplePay360 makes the Employee record the hub everything else hangs off. Contracts are
period-scoped and never edited in place (a raise is a new contract, the old one stays correct
for old payslips). A two-step Payrun wizard picks scope then employees, runs a configurable
Salary Structure/Rule engine, and surfaces warnings — missing bank details, duplicate payslips,
missing contracts — before anything is finalized. A live Payroll Dashboard aggregates real
attendance, leave, and payslip data, filterable by period, department, and employee type.

## Why this approach

Raw PERN (Postgres + Express + React + Node), no ORM, no BaaS, no managed auth — every layer has
a real, explainable answer, including the two guarantees that matter most in payroll: no two
overlapping active contracts for one employee (a Postgres exclusion constraint, not app-level
hope), and leave/payslip totals that are always computed live from ledger rows, never a field a
form can silently overwrite. See `DB_GUIDE.md` for the exact SQL.

## Tech Stack

- **Backend:** Node.js, Express, `node-pg`, `node-pg-migrate`, `jsonwebtoken`, `bcrypt`
- **Frontend:** React 18, Vite, TypeScript, TanStack Query, Zustand, React Hook Form, Zod,
  shadcn/ui, Tailwind CSS
- **Database:** PostgreSQL

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/aryanf192811-eng/pay360.git
cd pay360
cd backend && npm install
cd ../frontend && npm install

# 2. Database
createdb peoplepay360
cp backend/.env.example backend/.env   # fill in DATABASE_URL / JWT secrets
cd backend && npm run migrate:up
npm run seed

# 3. Run
# terminal 1
cd backend && npm run dev      # http://localhost:4000
# terminal 2
cd frontend && npm run dev     # http://localhost:5173
```

## Screenshots / Demo

_Placeholder — populated during Phase 6/7 as features ship. See `docs/screenshots/`._

## Repo

https://github.com/aryanf192811-eng/pay360
