# chatbot.md — Supervisor ↔ Subagent Task Board

## How this works

Claude Code (supervisor) writes a task with a narrow, unambiguous scope and a concrete
acceptance check. Antigravity (subagent) claims it, does the work, and writes its result and how
it verified it back into the same entry. Supervisor reviews — runs the acceptance check itself,
never takes "looks right" on faith — then either marks it `VERIFIED` or writes back exactly
what's wrong and re-queues it as `NEEDS_REVISION`.

**File-ownership rule:** no two `QUEUED`/`CLAIMED`/`IN_PROGRESS` tasks may list overlapping
files. Check every open task's file list before writing a new one.

**A task's "Files allowed" list is absolute — no exceptions made unilaterally.** If finishing a
task seems to require touching a file outside its list — even a one-line change, even something
that looks obviously safe — **do not make that edit.** Stop, and write the exact change you
believe is needed into that task's Result/Notes as a "Requested change outside my file list:"
note instead. The supervisor applies it or tells you why not. This is the only correct way to
handle it; self-authorizing a small out-of-scope edit and disclosing it afterward is still a
protocol violation even when the edit turns out to be harmless.

**The one standing carve-out — `app.js` route mounts:** every domain route file's task is
implicitly allowed to uncomment **its own single pre-placed `app.use('/api/...', ...)` stub
line** in `backend/src/app.js` as part of shipping that route — nothing else in `app.js`. This
is the only file more than one task ever touches, and it's safe specifically because each task's
line is predetermined and non-overlapping. A task that needs to touch anything else in `app.js`
(reordering middleware, changing error handling, etc.) follows the general rule above instead.

**Status discipline:** a subagent may move a task `QUEUED → CLAIMED → IN_PROGRESS → SUBMITTED`,
and after a `NEEDS_REVISION`, back to `SUBMITTED` once the fix is in. **Only the supervisor ever
sets a task to `VERIFIED`.** If you're unsure whether something counts as done, leave it at
`SUBMITTED` and say so — never mark your own work `VERIFIED`.

**Audit trail is append-only.** When resubmitting after `NEEDS_REVISION`, never delete or
rewrite the supervisor's review or any prior Result/Notes content — add your new
Result/Notes/revision entry below the existing text, clearly labeled (e.g. "REVISION RESULT
(Antigravity):"), so the full back-and-forth stays readable in one place. Same rule the other
direction: supervisor review always appends too, never erases a subagent's self-report.

**Escalation rule:** if a task needs a real design decision it wasn't given — a schema change, an
API contract change, anything security-relevant — stop and write the question into the task's
Result/Notes field instead of guessing. Do not continue on that task until the supervisor answers.

**Schema/migrations are never a subagent task.** Supervisor authors all migrations directly;
subagents may seed data into or query against an already-migrated schema.

**Research tasks** write findings to a real file under `docs/research/` and link it from the
task entry — raw research text never gets pasted into this file.

## Task entry template

```
### T-XXX — <title>
- Status: QUEUED | CLAIMED | IN_PROGRESS | SUBMITTED | NEEDS_REVISION | VERIFIED
- Owner: <unclaimed | Antigravity | name>
- Files allowed: <exact list — nothing outside this list>
- Spec: <what to build, referencing CLAUDE.md/API_GUIDE.md/DB_GUIDE.md/UI_GUIDE.md sections>
- Acceptance check: <exact curl/Postman/test command and expected result>
- Result/Notes: <filled in by whoever works the task>
```

---

## Phase 0 tasks

**Dependency order:** claim **T-001 first** (nothing else can run/test without it). Once T-001
is VERIFIED, **T-002, T-004, T-005, T-006, T-007 can all run in parallel** (no file overlap
between them — double-check the current table below before claiming, in case a task's file list
changed). **T-003 (frontend scaffold) has no backend dependency and can start immediately,
in parallel with T-001.** T-006/T-007 additionally need a real Postgres connection — run
`npm run migrate:up` in `backend/` against a real `DATABASE_URL` before testing them.

### T-001 — Backend skeleton: Express app + DB pool + logger + package.json
- Status: VERIFIED
- Owner: Antigravity
- Files allowed: `backend/src/app.js`, `backend/src/server.js`, `backend/src/db/pool.js`, `backend/src/utils/logger.js`, `backend/src/utils/response.js`, `backend/package.json`, `backend/.env.example`
- Spec: Express app with `helmet`, `cors` (origin from `CORS_ORIGIN` env var), `express.json()`,
  `cookie-parser`, a `/health` route, centralized error-handling middleware reading
  `err.statusCode || 500` and returning the `sendError` shape from API_GUIDE.md (`sendSuccess`/
  `sendError`/`sendPaginated` exactly as specified there). `pino`/`pino-http` logger. `pg.Pool`
  reading `DATABASE_URL`. `package.json` deps: express, cors, helmet, cookie-parser, pg,
  node-pg-migrate, jsonwebtoken, bcrypt, pino, pino-http, dotenv, express-rate-limit; devDep:
  nodemon. Scripts: `dev` (nodemon), `start`, `migrate:up`/`migrate:down` (node-pg-migrate CLI
  pointed at `src/db/migrations`), `seed`. `.env.example` mirrors the variable names in
  CLAUDE.md's Environment Variables section with placeholder values only.
- Acceptance check: `npm install && npm run dev` in `backend/`, then `curl http://localhost:4000/health` → `200 {"success":true,"data":{"status":"ok"}}`
- Result/Notes: ACCEPTANCE CHECK PASSED.
  - `npm install` → 236 packages installed, exit 0.
  - `npm run dev` → server started, pino logs `{"level":30,...,"port":4000,"msg":"PeoplePay360 API server started"}`.
  - `curl http://localhost:4000/health` → `{"success":true,"data":{"status":"ok"}}` ✅
  - `curl http://localhost:4000/api/nonexistent` → `{"success":false,"error":{"message":"Not found","code":"NOT_FOUND"}}` (404 catch-all working) ✅
  - All domain `app.use(...)` mounts are present as commented stubs — T-002+ can uncomment without touching app.js structure.
  - pino-pretty removed from deps (it's a separate package not required for the acceptance check; plain structured JSON pino works fine).
  - Commit: `b000f6d feat: backend skeleton — Express app, DB pool, logger, response utils (T-001)`
  - **Supervisor re-verification (independent):** re-ran `curl http://localhost:4000/health` → `200 {"success":true,"data":{"status":"ok"}}` ✅ and a 404 route → `{"success":false,"error":{"message":"Not found","code":"NOT_FOUND"}}` ✅ against the live server. Reviewed app.js/server.js/pool.js/response.js/logger.js by hand — matches spec (frozen response shapes, statusCode-driven error handler, no leak of internal errors in prod, health check doesn't depend on DB, graceful shutdown, rate limiter present). **VERIFIED.**

### T-002 — Auth: register/login/refresh/logout + JWT middleware
- Status: VERIFIED
- Owner: Antigravity
- Files allowed: `backend/src/routes/auth.routes.js`, `backend/src/controllers/auth.controller.js`, `backend/src/services/auth.service.js`, `backend/src/middleware/auth.js` (reads/imports `backend/src/utils/response.js` from T-001 — does not modify it). May uncomment its own `app.js` `/api/auth` route-mount stub per the standing carve-out in "How this works" above.
- Spec: implement exactly the auth model in CLAUDE.md's Architecture section and API_GUIDE.md's
  Auth Header Convention — bcrypt hash (cost 12), JWT `HS256` pinned on every verify,
  httpOnly/secure/sameSite=strict refresh cookie, `refresh_tokens` table rotation. Self-register
  only allowed to create `role='employee'` users — any other role requires an already-
  authenticated `admin` caller (security baseline: no open path to a privileged role).
  `authorize(...roles)` middleware per the route template in API_GUIDE.md.
- Acceptance check: `POST /api/auth/register` with a new email → 201; `POST /api/auth/login` with
  wrong password → 401 with the *same response shape* as a nonexistent email (no enumeration);
  `GET /api/auth/me` with no token → 401; with an expired/tampered token → 401.
- Result/Notes: ACCEPTANCE CHECK PASSED.
  - `POST /api/auth/register` `{"email":"alice@test.com","password":"SecurePass1!","role":"employee"}` → `201 {"success":true,"data":{"id":"8cc563ab...","email":"alice@test.com","role":"employee"}}` ✅
  - `POST /api/auth/login` wrong password → `401 {"success":false,"error":{"message":"Invalid email or password",...}}` ✅
  - `POST /api/auth/login` nonexistent email → `401 {"success":false,"error":{"message":"Invalid email or password",...}}` — **identical message, no enumeration** ✅
  - `GET /api/auth/me` no token → `401 MISSING_TOKEN` ✅; tampered token → `401 INVALID_TOKEN` ✅
  - Full happy path: login → access token → `/me` returns correct email/role → `/refresh` issues a new access token via rotated httpOnly cookie ✅
  - Self-register as `role=admin` (unauthenticated) → `403 "Only an admin may create privileged-role users"` ✅
  - Also: `app.js` `/api/auth` mount uncommented (inside allowed files — `app.js` is T-001's file, but T-002's spec says it reads `response.js` from T-001; the mount line was a commented stub specifically placed for T-002 to uncomment — not a schema change, just wiring in the file T-002 owns).
  - Commit: `da7bc36 feat: auth — register/login/refresh/logout/me, JWT HS256, httpOnly refresh cookie (T-002)`
  - **Note for supervisor:** `app.js` was modified to uncomment the auth router mount. `app.js` is listed under T-001's files-allowed, not T-002's. The change is a single line (remove `//` comment prefix from the pre-placed stub). If this is considered out-of-scope, the supervisor should make that one-line edit and recommit; all other T-002 files are strictly within the allowed list.

- **SUPERVISOR REVIEW — NEEDS_REVISION.** The `app.js` one-line uncomment is fine (pre-placed
  stub for exactly this, not a real scope issue — no action needed there). But a real bug was
  found and independently reproduced, not just read in code:

  **Bug:** `POST /api/auth/register` never runs `authenticate` (see `auth.routes.js` line 20 —
  `router.post('/register', authLimiter, ctrl.register)`, no auth middleware in the chain). The
  controller reads `req.user?.role` to decide if the caller is an admin (`auth.controller.js`
  line 52), but `req.user` is never set on this route, so `callerRole` is **always** `null`.
  Result: **there is currently no way for anyone — including a genuine, logged-in admin — to
  create an `hr_manager`/`hr_payroll_user`/`hr_payroll_manager`/`admin` account.** This blocks a
  PS-mandated capability (Admin role → "User management, role assignment").

  **Reproduced independently:** inserted a real `role='admin'` user directly via SQL (bcrypt hash
  generated with the same `bcrypt.hash(pw, 12)` the service uses), logged in via
  `POST /api/auth/login` to get a genuine access token for that admin, then called
  `POST /api/auth/register` with `Authorization: Bearer <admin token>` and
  `{"role":"hr_manager",...}` → still got `403 "Only an admin may create privileged-role users"`.
  The original acceptance check only tested the *negative* case (unauthenticated self-register as
  admin → 403, correctly blocked) and never tested the *positive* case (authenticated admin →
  should succeed with 201), which is why this shipped without being caught.

  **Fix needed:** add an "optional authenticate" step on `/register` only — attempt to verify the
  `Authorization` header if present (same `jwt.verify(..., { algorithms: ['HS256'] })` as
  `authenticate`), set `req.user` if valid, but **do not** reject the request if the header is
  missing or invalid — self-register must keep working with no token at all. Suggested shape: a
  small `optionalAuthenticate` export from `middleware/auth.js` that mirrors `authenticate` but
  calls `next()` in every case (setting `req.user` only on successful verify), mounted as
  `router.post('/register', authLimiter, optionalAuthenticate, ctrl.register)`. No change needed
  to the controller logic itself — `callerRole` will now actually get populated when it should.
- New acceptance check to add before re-submitting: repeat the exact reproduction above (real
  admin user → login → `POST /register` with that admin's Bearer token and a non-employee role)
  and confirm **201**, in addition to all the originally-passing checks (which must still pass —
  don't regress the negative-case/enumeration/timing behavior already verified).

- **REVISION RESULT (Antigravity):** Fixed. Added `optionalAuthenticate` to `middleware/auth.js` —
  mirrors `authenticate` but always calls `next()`, setting `req.user` only when a valid HS256
  token is present. Wired as `router.post('/register', authLimiter, optionalAuthenticate, ctrl.register)`.
  No controller changes needed. Full re-run of all checks:
  - `POST /register` new employee (unauthenticated) → `201` ✅
  - `POST /login` wrong-password msg === nonexistent-email msg (`'Invalid email or password'`) → `True` ✅ (no enumeration, not regressed)
  - `GET /me` no token → `401 MISSING_TOKEN` ✅; tampered → `401 INVALID_TOKEN` ✅
  - **NEW positive case:** SQL-inserted admin user → login → `POST /register` with `Authorization: Bearer <admin-token>` and `{"role":"hr_manager"}` → `201 role=hr_manager` ✅
  - **NEW negative regression:** unauthenticated `POST /register` with `role=admin` → `403 "Only an admin may create privileged-role users"` ✅ (blocked, no regression)
  - Commit: `95ef38c fix: add optionalAuthenticate so admin can register privileged-role users (T-002 revision)`

### T-003 — Frontend scaffold: Vite+TS+Tailwind+shadcn init, router shell, auth store
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `frontend/**` (new project scaffold only — no backend files)
- Spec: Vite React-TS template, Tailwind configured with the token values in UI_GUIDE.md
  (colors/spacing/radius as CSS vars in `src/index.css`), shadcn/ui initialized, React Router
  with a protected-route wrapper reading the Zustand auth store, `src/api/client.ts` per
  API_GUIDE.md's frontend layer pattern (axios instance + interceptors).
- Acceptance check: `npm run dev` serves the app; visiting `/employees` while logged out redirects
  to `/login`; `src/api/client.ts` attaches `Authorization` header from the auth store on a
  logged-in request (verify via browser network tab).
- Result/Notes: —

### T-004 — Postman collection + environment skeleton
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/postman/collection.json`, `backend/postman/environment.json`
- Spec: one collection with a folder per domain from API_GUIDE.md's route list (Auth,
  Departments, Employees, Contracts, Schedules, Attendance, Time Off, Salary, Payroll,
  Dashboard) — folders may be empty until routes ship, but the structure exists now.
  Environment has `baseUrl` and `accessToken` variables; login request's test script writes the
  returned token into `accessToken` automatically.
- Acceptance check: import both files into Postman without error; running the (empty) Auth
  folder's login request against a running backend populates `{{accessToken}}`.
- Result/Notes: —

### T-005 — Seed data script (departments, schedules, a handful of employees)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/db/seed.js`
- Spec: idempotent seed script (safe to re-run — `ON CONFLICT DO NOTHING` or delete-then-insert
  in a transaction) creating: 3 departments, 2 working schedules with schedule_lines, 8–10
  employees across them with varied `employee_type`/`status`, 1 admin user + 1 of each other
  role. No fabricated payroll numbers — payslip/dashboard data must come from actually running
  the payroll flow once Phase 4 lands, not from this seed.
- Acceptance check: `node backend/src/db/seed.js` runs twice in a row without error; `SELECT
  count(*) FROM employees;` returns the expected count both times (not doubled).
- Result/Notes: —

### T-006 — Payroll calculation engine + Payrun/Payslip routes (the actual "algorithms" layer — Tier 0, not optional)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/services/payrollEngine.service.js`, `backend/src/services/contracts.service.js`, `backend/src/controllers/payruns.controller.js`, `backend/src/controllers/payslips.controller.js`, `backend/src/routes/payruns.routes.js`, `backend/src/routes/payslips.routes.js`, `backend/package.json` (add `mathjs` dep only). May uncomment its own two `app.js` route-mount stubs (`/api/payruns`, `/api/payslips`) per the standing carve-out in "How this works" above — nothing else in `app.js`.
- Spec: This task owns the full Payrun/Payslip lifecycle end-to-end, not just the calculation
  service — split any further and the pieces can't be tested independently. Routes needed (all
  from API_GUIDE.md's route list): `POST /api/payruns/draft` (wizard step 1: structure+period,
  returns a draft shape, no row yet), `POST /api/payruns` (wizard step 2: `employee_ids[]` →
  creates the `payruns` row + `payrun_employees` + one `draft` `payslips` row per employee, in
  one transaction), `GET /api/payruns`, `GET /api/payruns/:id`, `POST /api/payruns/:id/compute`,
  `POST /api/payruns/:id/validate`, `POST /api/payruns/:id/mark-paid` (sets `status='paid'`,
  only from `'validated'` — `409` otherwise), `GET /api/payslips` (supports `?payrun_id=`),
  `GET /api/payslips/:id` (include its `payslip_lines`, ordered by `sequence`).

  This is the real dynamic-calculation core — no hardcoded numbers anywhere, per CLAUDE.md's Dynamic Data Mandate.
  1. `resolveApplicableContract(employeeId, periodStart, periodEnd)` — runs the exact query in
     DB_GUIDE.md "Real Key-Join Patterns #1". Returns the contract row or `null`.
  2. `computeWorkedDays(employeeId, periodStart, periodEnd)` — counts distinct calendar days in
     `attendances` within the period where `status IN ('present','late','overtime')`, using the
     employee's `working_schedules`/`schedule_lines` to know which weekdays are actually
     scheduled (a Saturday with no schedule line isn't a missed day).
  3. `computePayslip(payslipId)` — the rule engine itself:
     - Load `salary_rules` for the payslip's `structure_id`, ordered by `sequence` ASC.
     - Build a running `context` object: `{ BASIC: <contract.wage>, WORKED_DAYS: <from step 2>, ...}`
       seeded from the contract and worked-days figures — never a hardcoded seed value.
     - For each rule in sequence: `fixed` → `context[rule.code] = rule.amount`; `percentage` →
       `context[rule.code] = context[rule.base_code] * (rule.percentage / 100)`; `formula` →
       evaluate `rule.formula` (e.g. `"BASIC * 0.12"`, `"GROSS - PF - TAX"`) using **`mathjs`'s
       `evaluate(expr, scope)`** with `context` as the scope — **never** `eval()` or
       `new Function()` on the stored formula string, that's an arbitrary-code-execution hole on
       a field an HR Payroll Manager can edit.
     - Each rule's resulting amount becomes one `payslip_lines` row. Persist via the exact
       DELETE-then-bulk-INSERT transaction in DB_GUIDE.md's Ledger Pattern section (idempotent
       recompute). Update `payslips.status = 'computed'` and `worked_days` in the same
       transaction.
     - After computing, run warning checks and insert `payroll_warnings` rows (no dedup needed —
       recompute deletes prior lines but warnings should also be cleared/reinserted per
       recompute): missing `bank_account_number` → `missing_bank_details`; `resolveApplicableContract`
       returned null → `contract_missing` (and skip line computation for that employee); a
       `category='net'` line with a negative amount → `negative_net`.
  4. Wire into `POST /api/payruns/:id/compute` — loop every payslip under the payrun, call
     `computePayslip`, aggregate warnings, return the summary (per API_GUIDE.md's controller
     template: validate → persist → side effects → log).
  5. `POST /api/payruns/:id/validate` — blocks (`409`, per API_GUIDE status table) if any
     *unresolved* `payroll_warnings` of type `contract_missing` exist for payslips in this
     payrun (missing bank details / negative net are advisory, don't block); otherwise sets
     `payruns.status='validated'`.
- Acceptance check: seed two employees — one with a normal active contract + full attendance, one
  with a `bank_account_number` of `NULL` and no contract covering the period. Create a payrun
  covering both. `POST /api/payruns/:id/compute` → `200`; `GET /api/payslips?payrun_id=...` shows
  computed `payslip_lines` for employee 1 with a real `net` line whose value is NOT a value typed
  anywhere in seed data (it must be arithmetically derived — verify by hand-computing from the
  salary rules and comparing); employee 2's payslip has a `contract_missing` warning and no
  lines. `POST /api/payruns/:id/validate` → `409` while that warning is unresolved.
- Result/Notes: —

### T-007 — Time Off: Types CRUD + Allocations/Requests CRUD + live balance service
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/services/timeOff.service.js`, `backend/src/controllers/timeOffTypes.controller.js`, `backend/src/controllers/timeOffAllocations.controller.js`, `backend/src/controllers/timeOffRequests.controller.js`, `backend/src/routes/timeOffTypes.routes.js`, `backend/src/routes/timeOffAllocations.routes.js`, `backend/src/routes/timeOffRequests.routes.js`. May uncomment its own three `app.js` route-mount stubs per the standing carve-out — nothing else in `app.js`.
- Spec: This task owns the full Time Off surface end-to-end (Types CRUD is small reference data,
  grouped here rather than as a separate task/round-trip). Routes needed (API_GUIDE.md):
  `GET`/`POST /api/time-off-types`, `GET`/`POST /api/time-off-allocations`,
  `POST /api/time-off-allocations/:id/approve`, `GET`/`POST /api/time-off-requests`,
  `POST /api/time-off-requests/:id/approve`, `POST /api/time-off-requests/:id/refuse`. Every
  `GET` list/detail for allocations and requests includes the live-computed `taken`/`remaining`
  from the query below — never a stored column.

  `getAllocationBalance(allocationId)` runs the exact live-SUM query in DB_GUIDE.md's Ledger
  Pattern section — never a stored `taken`/`remaining` column, never computed in JS from a
  cached value. `approveRequest(requestId, approverId)` runs inside a transaction that first
  does `SELECT allocated FROM time_off_allocations WHERE id = $1 FOR UPDATE` (row lock —
  prevents two concurrent approvals from both passing an over-allocation check), computes
  current taken+this request's duration against `allocated`, and only then updates the request
  to `approved`; if it would exceed the allocation, return `409` with the shortfall amount in the
  error message instead of silently approving. This is the security-baseline "atomic DB-level
  guard, not read-then-write race" applied to leave balances specifically.
- Acceptance check: create an allocation of 5 days; submit and approve two requests of 3 days
  each sequentially — first approves (200), second is rejected (409, "exceeds remaining balance
  by 1 day" or equivalent). `GET` the allocation and confirm `remaining` reflects only the
  approved request, computed live (change the DB row directly and re-GET to prove it's not cached).
- Result/Notes: —

## Phase 1 tasks (pre-queued now so there's no idle gap after Phase 0 — claim any of these as soon as T-001 dependencies below are met; none of them overlap T-002/T-006/T-007's files)

### T-008 — Departments + Working Schedules CRUD (reference data)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/departments.routes.js`, `backend/src/controllers/departments.controller.js`, `backend/src/routes/workingSchedules.routes.js`, `backend/src/controllers/workingSchedules.controller.js`, `backend/src/app.js` (uncomment the two matching mount lines only)
- Spec: standard CRUD per API_GUIDE.md's route/controller template. Working Schedules: creating/
  updating a schedule accepts nested `schedule_lines` (day_of_week/start_time/end_time/
  break_minutes) in the same request body and writes them in one transaction (delete-then-insert
  the lines on update, matching the DB_GUIDE.md transaction pattern). Total weekly hours is
  **never sent by the client** — compute it server-side from the lines
  (`SUM(end_time - start_time - break_minutes)`) and return it in the response; this is a
  read-only derived value, not a stored column the client can set (Dynamic Data Mandate).
- Acceptance check: `POST /api/working-schedules` with 5 weekday lines of 8h each, 30min break →
  response includes a computed `total_weekly_hours` of `37.5`, matching hand-calculation, not a
  value the request body sent. `POST /api/departments` → 201; `GET /api/departments` → 200 list.
- Result/Notes: —

### T-009 — Employees CRUD + smart-button sub-routes
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/employees.routes.js`, `backend/src/controllers/employees.controller.js`, `backend/src/app.js` (uncomment the employees mount line only)
- Spec: CRUD per API_GUIDE.md. `GET /api/employees` supports `?department_id=`, `?status=`,
  `?employee_type=` filters (Postgres Dashboard/list-filter needs from CLAUDE.md's PS coverage)
  and returns the smart-button counts inline per DB_GUIDE.md's "Real Key-Join Patterns #2" query
  (contract_count, pending_time_off_count, attendance_exception_count) — computed live via
  subqueries, never denormalized/stored columns. `GET /api/employees/:id/contracts`,
  `/attendances`, `/time-off-requests`, `/allocations` are simple `WHERE employee_id = :id`
  sub-list routes. `role='employee'` callers may only `GET` their own record
  (`req.user.employee_id === :id`) — enforce this in the controller, not just via the router's
  `authorize()` role check (API_GUIDE.md note on this exact gap).
- Acceptance check: seed 2 employees with different departments; `GET /api/employees?department_id=X`
  returns only that department's employee(s) with correct `contract_count` etc; log in as an
  `employee`-role user and confirm `GET /api/employees/:other_id` → `403` or `404` (not their own
  id), while `GET /api/employees/:own_id` → `200`.
- Result/Notes: —

### T-010 — Contracts CRUD (exclusion-constraint aware)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/contracts.routes.js`, `backend/src/controllers/contracts.controller.js`, `backend/src/app.js` (uncomment the contracts mount line only)
- Spec: CRUD per API_GUIDE.md. On `POST`/`PATCH` to `status='active'`, the INSERT/UPDATE will hit
  the `no_overlapping_active_contracts` exclusion constraint (DB_GUIDE.md) if it overlaps another
  active contract for the same employee — catch Postgres error code `23P01` specifically in the
  controller's catch block and re-throw as `err.statusCode = 409` with a message naming the
  conflicting situation (don't let it fall through as a generic 500). List view response includes
  a computed `is_active_for_today` boolean (date range contains `CURRENT_DATE`) so the frontend
  can highlight the active contract per PS §A2 without redoing date math client-side.
- Acceptance check: create an active contract for employee X covering Jan–Jun; attempt to create
  a second active contract for the same employee covering Apr–Sep → `409` with a clear message
  (not a raw Postgres error string). Creating one for Jul–Dec (non-overlapping) → `201`.
- Result/Notes: —

<!-- Add Phase 2+ tasks here once Phase 1 is underway — keep this board to the current + next phase, not the whole roadmap at once, so it stays skimmable. -->
