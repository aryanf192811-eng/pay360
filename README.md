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

- **Backend:** Node.js, Express, `node-pg`, `node-pg-migrate`, `jsonwebtoken`, `bcrypt`, `pino`
- **Frontend:** React 18, Vite, TypeScript, TanStack Query, Zustand, React Hook Form, React Router,
  Tailwind CSS, shadcn/ui-derived primitives
- **Database:** PostgreSQL (raw SQL, no ORM)

---

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

### Environment variables

`backend/.env`:

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/peoplepay360
JWT_ACCESS_SECRET=changeme-access-secret
JWT_REFRESH_SECRET=changeme-refresh-secret
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=payroll@peoplepay360.local
CORS_ORIGIN=http://localhost:5173
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:4000/api
```

When `SMTP_HOST` is unset, "Send Payslips" degrades gracefully — it logs the would-be send and
marks payslips `email_status: 'queued_no_provider'` instead of throwing.

### Demo credentials

All seeded accounts share the password **`SeedPass1!`**.

| Email | Role |
|---|---|
| alice.admin@example.com | Admin |
| bob.hr@example.com | HR Manager |
| charlie.payroll@example.com | HR Payroll User |
| diana.pm@example.com | HR Payroll Manager |
| eve.engineer@example.com | Employee |
| frank.engineer@example.com | Employee |
| grace.sales@example.com | Employee |
| heidi.sales@example.com | Employee (part-time) |
| ivan.c@example.com | Employee (contract) |

`npm run seed` creates the 9 employees/departments/schedules above. Contracts, a salary
structure, attendance, time-off, and a paid payrun are not part of the seed script — they're
demo-data that can be created live through the UI (Employees → Contracts → Salary Config →
Payroll), which is also the intended demo flow.

---

## Architecture

```
backend/src/
  routes/        one file per resource — thin, delegates to controllers
  controllers/   request validation + orchestration, no raw SQL beyond simple queries
  services/      the two hand-written cores: payrollEngine.service.js, timeOff.service.js
  middleware/    authenticate, authorize(...roles)
  db/migrations/ node-pg-migrate migrations — the schema's real source of truth
  db/seed.js     baseline demo data (departments, schedules, employees, users)
  utils/         response envelope, logger

frontend/src/
  api/           one file per resource, thin axios wrappers — every function here maps 1:1
                 to a backend route (see API Reference below)
  pages/         one component per route
  components/    shared UI (Layout, Avatar, StatusBadge, KpiCard, EmptyState, ui/*)
  store/         auth.store.ts (Zustand) — the only global client state
  lib/           cn() class-merge helper
```

### Auth model

JWT access token (15 min TTL, HS256 pinned) carried in memory (Zustand), plus an httpOnly,
`sameSite=strict` refresh-token cookie rotated on every use and revocable via the
`refresh_tokens` table. Five roles enforced at three independent layers: nav visibility (UX only),
`ProtectedRoute roles={...}` on each frontend route, and `authorize(...roles)` middleware on each
backend route — the last two are the actual security boundary, verified with real accounts across
all five roles.

| Role | Can |
|---|---|
| `employee` | See and manage only their own record: attendance, time off, payslips |
| `hr_manager` | Employees, Contracts, Working Schedules, Attendance, Time Off (read/approve) |
| `hr_payroll_user` | Everything HR Manager has, plus create/compute payruns |
| `hr_payroll_manager` | Everything above, plus validate/mark-paid/send payslips, Dashboard |
| `admin` | Everything, plus User Management (linking login accounts to employee records) |

### Database guarantees worth calling out

- **`no_overlapping_active_contracts`** — a Postgres `EXCLUDE USING gist` constraint on
  `contracts`, not an application check. Two active contracts for the same employee with
  overlapping date ranges cannot exist at the DB level.
- **Ledger pattern** — `time_off_allocations.taken`/`.remaining` and payslip totals are never
  stored columns; every read sums the real `time_off_requests`/`payslip_lines` rows live.
- **Frozen payslip lines** — a payslip's `payslip_lines` are written once at compute time. Editing
  a Salary Rule afterward changes future payruns only; past payslips stay exactly as computed.

---

## API Reference

Every route below is mounted in `backend/src/app.js` and called by at least one function in
`frontend/src/api/*.ts` — this mapping was audited end-to-end (49 distinct frontend calls, 100%
resolve to a real route; zero orphaned calls, zero mocked endpoints).

| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /me` |
| Users (admin) | `GET /api/users`, `PATCH /api/users/:id` |
| Departments | `GET /api/departments`, `POST /` |
| Working Schedules | `GET /api/working-schedules`, `GET /:id`, `POST /`, `PATCH /:id` |
| Employees | `GET /api/employees`, `GET /:id`, `POST /`, `PATCH /:id`, `GET /:id/contracts`, `GET /:id/attendances`, `GET /:id/time-off-requests`, `GET /:id/allocations` |
| Contracts | `GET /api/contracts`, `GET /:id`, `POST /`, `PATCH /:id` |
| Attendances | `GET /api/attendances`, `GET /:id`, `POST /` (check-in, or check-out if an open entry exists), `PATCH /:id` (manual correction) |
| Time Off Types | `GET /api/time-off-types`, `POST /` |
| Time Off Allocations | `GET /api/time-off-allocations`, `GET /:id`, `POST /`, `POST /:id/approve` |
| Time Off Requests | `GET /api/time-off-requests`, `POST /`, `POST /:id/approve`, `POST /:id/refuse` |
| Salary Structures | `GET /api/salary-structures`, `GET /:id`, `POST /`, `PATCH /:id` |
| Salary Rules | `GET /api/salary-rules`, `POST /`, `PATCH /:id` |
| Payruns | `POST /api/payruns/draft`, `POST /`, `GET /`, `GET /:id`, `POST /:id/compute`, `POST /:id/validate`, `POST /:id/mark-paid`, `POST /:id/send-payslips` |
| Payslips | `GET /api/payslips`, `GET /:id`, `GET /:id/pdf` |
| Dashboard | `GET /api/dashboard?period_start=&period_end=&department_id=&employee_type=` |

Every response is wrapped `{ success: true, data }` or `{ success: false, error: { message } }`
(`backend/src/utils/response.js`) — the frontend axios client and every `api/*.ts` function
unwrap `data.data` consistently.

---

## Frontend Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing | Public |
| `/login` | Login | Public |
| `/my-space` | Employee self-service home | Employee |
| `/dashboard` | Payroll Dashboard | Payroll roles |
| `/employees`, `/employees/new`, `/employees/:id`, `/employees/:id/edit` | Employee hub, create/edit forms, 360 detail | HR roles |
| `/contracts` | Contracts list + create | HR roles |
| `/working-schedules` | Working Schedule list + weekly-pattern form | HR roles |
| `/attendance` | Check-in/out (employee) or master table + corrections (HR) | All authenticated |
| `/time-off` | Requests / Allocations / Types (tabbed) | All authenticated |
| `/payroll`, `/payroll/payruns/:id` | Payrun list + 2-step wizard, Payrun command center | Payroll roles |
| `/payroll/payslips/:id` | Payslip calculation trace + PDF | Employee (own) + Payroll roles |
| `/salary-config` | Salary Structures/Rules editor | Payroll roles |
| `/user-management` | Link login accounts to employee records | Admin |

---

## Design System

Tokens live in `frontend/src/index.css` (light-mode only) and are wired through
`tailwind.config.js`; see `UI_GUIDE.md` for the full rationale and component-composition rules.
The `ui-ux-pro-max` design skill (installed under `.claude/skills/`) was used to generate the
palette/typography pairing for this product category (enterprise HR/payroll SaaS) rather than
picking one by eye.

**One hard rule if you touch tokens:** every Tailwind spacing/sizing class in this project must
use a number from the custom scale (`4 8 12 16 24 32 48 64`) or an explicit `[Npx]` bracket value.
Any other number (`h-14`, `py-11`, `px-20`, ...) silently falls back to Tailwind's *default*
rem-based scale and renders at roughly 4x the size you'd expect — this caused a real, app-wide
visual bug this session (every "small" icon rendering as ~56–80px) that was invisible to
`tsc`/`vite build` because it's not a type or compile error.

---

## Testing

- `backend/postman/collection.json` + `environment.json` — Postman/newman coverage (Auth, Payroll,
  Time Off folders have real requests + test scripts; run with
  `npx newman run backend/postman/collection.json -e backend/postman/environment.json`).
- Manual click-throughs and security checks are logged with dated entries under `docs/testing/`.
- No automated frontend test suite — verification for UI work in this repo is: `npm run build`
  (0 TypeScript errors) plus a real click-through against the live backend with a real seeded
  account, not just a build pass.

## Repo

https://github.com/aryanf192811-eng/pay360
