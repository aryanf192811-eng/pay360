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
- Status: VERIFIED
- Owner: Antigravity
- Files allowed: `frontend/**` (new project scaffold only — no backend files)
- Spec: Vite React-TS template, Tailwind configured with the token values in UI_GUIDE.md
  (colors/spacing/radius as CSS vars in `src/index.css`), shadcn/ui initialized, React Router
  with a protected-route wrapper reading the Zustand auth store, `src/api/client.ts` per
  API_GUIDE.md's frontend layer pattern (axios instance + interceptors).
- Acceptance check: `npm run dev` serves the app; visiting `/employees` while logged out redirects
  to `/login`; `src/api/client.ts` attaches `Authorization` header from the auth store on a
  logged-in request (verify via browser network tab).
- Result/Notes: ACCEPTANCE CHECK PASSED.
  - Initialized Vite+React+TS app, configured Tailwind CSS with PeoplePay360 tokens from UI_GUIDE.
  - Setup shadcn `components.json` and `lib/utils.ts`.
  - Created Zustand auth store `src/store/auth.store.ts` handling token state in-memory.
  - Configured `src/api/client.ts` with Axios interceptor that automatically attaches the token and attempts `/api/auth/refresh` on 401.
  - Setup React Router in `src/App.tsx` and `src/main.tsx` with a `<ProtectedRoute>` that correctly redirects unauthenticated users to `/login`.
  - Fake login on the `/login` screen populates the store to prove the frontend logic.
  - `npm run build` passes successfully without TypeScript errors.
  - Commit: `7d781e5 feat: frontend scaffold — Vite+TS, Tailwind, shadcn, router, auth store (T-003)`
  - **Supervisor re-verification:** `npm run build` re-run independently → clean, 0 TypeScript
    errors, `dist/` produced. Read `App.tsx`/`client.ts`/`auth.store.ts` by hand — placeholder
    pages are honestly labeled as placeholders ("Real login form comes in a later task"), not
    overclaimed as finished. Interceptor correctly avoids an infinite loop on `/refresh` itself
    401ing. Matches the scaffold's actual scope. **VERIFIED.**

### T-004 — Postman: real requests + tests for every LIVE route (Auth, Payroll, Time Off)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/postman/collection.json`, `backend/postman/environment.json`
- Spec: Auth, Payroll (Payruns+Payslips), and Time Off (Types/Allocations/Requests) routes are
  now live and VERIFIED (T-002, T-006, T-007) — this task fills in **real requests with real
  Postman test scripts** for those three folders now, not placeholders. (Employees/Contracts/
  Departments/Schedules/Salary folders stay empty until T-008/009/010/011 land — don't guess
  their shapes.) For every request: a `pm.test(...)` asserting the status code and the
  `response wrapper shape` from API_GUIDE.md (`success`/`data` or `success`/`error`). Specifically:
  - **Auth folder:** Register → Login (test script writes `accessToken` from
    `pm.response.json().data.accessToken` into the environment) → Me → Refresh → Logout.
  - **Payroll folder:** Draft → Create → Compute → Validate → Mark Paid, chained via environment
    variables (`payrunId` written by Create's test script, reused by the rest) — mirrors the exact
    flow verified in T-006's Result/Notes above, so it's testing something already known-correct,
    not guessing a new scenario.
  - **Time Off folder:** Create Type → Create Allocation → Approve Allocation → Create Request →
    Approve Request → (a second request that intentionally over-allocates, asserting `409`) —
    mirrors T-007's verified scenario above.
  Then run the whole thing with `newman` (`npx newman run backend/postman/collection.json -e
  backend/postman/environment.json`) against the live local backend and paste the pass/fail
  summary into Result/Notes — an import that "looks right" in the Postman GUI is not the
  acceptance check, a clean `newman` run is.
- Acceptance check: `npx newman run backend/postman/collection.json -e backend/postman/environment.json`
  exits `0` with all requests passing, run against `backend/` started fresh (`npm run dev`) with
  an empty-ish dev DB (or accept pre-existing T-006/T-007 test fixtures — either is fine, just
  state which in Result/Notes).
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
- Status: VERIFIED
- Owner: Supervisor
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
- Result/Notes: **SUPERVISOR-AUTHORED AND VERIFIED** (payroll math correctness is high-blast-radius
  if wrong, so this and T-007 are hand-written by the supervisor rather than delegated — CLAUDE.md
  workflow note updated accordingly). Built `payrollEngine.service.js`, `contracts.service.js`,
  `payruns.controller.js`, `payslips.controller.js`, `payruns.routes.js`, `payslips.routes.js`.
  End-to-end verified against a live server + real Postgres, test fixtures inserted directly via
  SQL (department, 2 employees — one with `bank_account_number` NULL, one contract covering only
  the first employee, a real "Regular Salary" structure with HRA/GROSS/PF/NET rules):
  - `POST /payruns/draft` → live eligibility list, correctly shows `has_contract: false` for the
    uncontracted employee (no static/hardcoded list) ✅
  - `POST /payruns` (both employees) → `POST .../compute` → employee 1: `NET = 54000`, hand-verified
    (BASIC 50000 → HRA 20%=10000 → GROSS=60000 → PF 12%=6000 → NET=GROSS-PF=54000, all via mathjs
    `evaluate()`, not `eval()`) ✅. Employee 2: `contract_missing` + `missing_bank_details`
    warnings, zero `payslip_lines`, `net: null` ✅
  - `POST .../validate` on the mixed payrun → `409` (unresolved `contract_missing`) ✅
  - Clean payrun (contracted employee only): compute → validate (`200`) → mark-paid (`200`) →
    re-fetched payrun shows `status: 'paid'` ✅
  - Guard: `mark-paid` on a merely-`computed` (not yet validated) payrun → `409` ✅
  - RBAC: `employee`-role token on `GET /payruns` → `403 FORBIDDEN` ✅
  - **Bug found and fixed during this verification (unrelated to T-006's own logic, but affects
    every date field in the schema):** node-pg's default DATE-column parser round-trips through a
    JS `Date`, which serializes via UTC and shifts the calendar date backward a day under a
    positive-UTC-offset server timezone (`2026-01-01` was coming back as
    `2025-12-31T18:30:00.000Z`). Fixed centrally in `db/pool.js` with
    `types.setTypeParser(1082, val => val)` (OID 1082 = `date`) — returns the raw string instead
    of a Date object. `timestamptz` columns are untouched (those are real instants). This fixes
    every `date`-typed column app-wide (contract/payrun/payslip periods, `hire_date`, etc.), not
    just this task's fields — worth knowing about for anyone who already wrote date-comparison
    logic assuming the old (buggy) shifted value.
  - Local dev DB now has manual test fixtures (dept `Engineering`, employees `EMP-1001`/`EMP-1002`,
    structure `Regular Salary`) inserted directly via SQL for this verification — not committed
    anywhere, not real seed data; T-005's actual seed script should still create its own.
  - **New task queued: T-011 (Salary Structures + Salary Rules CRUD)** — nothing currently owns
    those routes; this task's own testing had to insert them via raw SQL to have something to
    compute against. See below.

### T-007 — Time Off: Types CRUD + Allocations/Requests CRUD + live balance service
- Status: VERIFIED
- Owner: Supervisor
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
- Result/Notes: **SUPERVISOR-AUTHORED AND VERIFIED** (concurrency correctness on leave balances —
  same high-blast-radius reasoning as T-006). Built `timeOff.service.js` (`getAllocationBalance`,
  `approveRequest`, `refuseRequest`, `approveAllocation`) plus all three controllers/routes.
  - Allocation of 5 days created, draft by default; approving a request against a **draft**
    (not-yet-approved) allocation correctly `409`s first — allocations require their own approval
    before use (PS §A4), enforced, not just documented ✅
  - Allocation approved → first 3-day request approves (`200`) → `GET` shows `taken: 3.00,
    remaining: 2.00`, computed live via the SUM query, not cached ✅
  - Second 3-day request (only 2 remaining) → `409 "...exceed the allocation by 1.00 unit(s)
    (remaining: 2)"` — exact acceptance-check scenario, passes ✅
  - **Beyond the original check — genuine concurrency stress test, not just sequential calls:**
    fired two real concurrent `approve` requests (`curl ... & curl ... & wait`) against the same
    allocation, each individually within the remaining balance but together exceeding it
    (remaining 2, two requests of 1.2 each). Result: exactly one succeeded (`200`), the other
    correctly recomputed the balance post-commit and rejected (`409`, remaining had dropped to
    0.8). This is the actual property T-007 exists to guarantee — the `SELECT ... FOR UPDATE` row
    lock on the allocation genuinely serializes concurrent approvers rather than both reading a
    stale balance and both passing. Final `taken: 4.20` confirms no over-allocation occurred ✅
  - RBAC: `employee`-role token → `403` on approve/refuse ✅; querying another employee's
    `employee_id` as an `employee` role is silently ignored in favor of the caller's own
    `employee_id` (returns their own empty list rather than leaking someone else's data) ✅
  - Minor fix during verification: a floating-point display artifact in the shortfall error
    message (`remaining: 0.7999999999999998`) — cosmetic only, the underlying numeric comparison
    was always correct; fixed with `.toFixed(2)` on the displayed value.

## Phase 1 tasks (pre-queued now so there's no idle gap after Phase 0 — claim any of these as soon as T-001 dependencies below are met; none of them overlap T-002/T-006/T-007's files)

### T-008 — Departments + Working Schedules CRUD (reference data)
- Status: VERIFIED
- Owner: Supervisor
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
- Result/Notes: **SUPERVISOR-AUTHORED AND VERIFIED.** Built both controllers/routes.
  `POST /working-schedules` (5×8h, 30min break) → `total_weekly_hours: 37.5` exact ✅.
  `GET /departments` → live `headcount` per department (Engineering: 2, Sales: 0) ✅.

### T-009 — Employees CRUD + smart-button sub-routes
- Status: VERIFIED
- Owner: Supervisor
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
- Result/Notes: **SUPERVISOR-AUTHORED AND VERIFIED.** Added a race-safe `employee_code_seq`
  Postgres sequence (migration `1757100000000`) rather than SELECT-COUNT-based codes. Created
  employee → `employee_code: "EMP-1000"` auto-generated ✅. Department filter correctly scoped
  ✅, smart-button counts live and correct (Rahul: `contract_count: 1`, `pending_time_off_count: 2`
  matching real submitted requests from T-007's testing) ✅. Employee-role ownership boundary:
  `403` on another employee's record ✅.

### T-011 — Salary Structures + Salary Rules CRUD
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/salaryStructures.routes.js`, `backend/src/controllers/salaryStructures.controller.js`, `backend/src/routes/salaryRules.routes.js`, `backend/src/controllers/salaryRules.controller.js`, `backend/src/app.js` (uncomment the two matching mount lines only)
- Spec: CRUD per API_GUIDE.md. `GET /api/salary-structures` list includes a live count of rules
  and employees using it (`(SELECT COUNT(*) FROM salary_rules WHERE structure_id = s.id)`,
  `(SELECT COUNT(*) FROM contracts WHERE salary_structure_id = s.id AND status='active')` —
  computed, never stored). `GET`/`POST /api/salary-rules` (query by `?structure_id=`) — role
  gating per API_GUIDE.md's role table: `hr_payroll_manager`/`admin` get full CRUD;
  `hr_payroll_user` gets **read-only** (`GET` only, `authorize()` the write routes to
  `hr_payroll_manager`/`admin` only). Validate `computation_method` is one of
  `fixed`/`percentage`/`formula`; if `formula`, do **not** evaluate it here — just store it as
  text (T-006's `payrollEngine.service.js` is the only place formulas are ever evaluated, via
  `mathjs`, never `eval()`). `category` must be one of `basic`/`allowance`/`gross`/`deduction`/`net`.
- Acceptance check: `POST /api/salary-structures` → 201; `POST /api/salary-rules` with a
  `hr_payroll_user` token → 201 for `GET` but `403` for `POST`/`PATCH`; with `hr_payroll_manager`
  token → `201`/`200` succeed. `GET /api/salary-structures` shows correct live rule/employee
  counts for a structure that already has rules/contracts (from T-006's test fixtures or your own).
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

## Phase 2 tasks — PS-mandated modules with ZERO code so far (found during a full PS gap-check, not previously queued)

### T-012 — Attendance CRUD (check-in/out, manual correction) — Tier 0, currently missing entirely
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/attendances.routes.js`, `backend/src/controllers/attendances.controller.js`, `backend/src/app.js` (uncomment the attendances mount line only)
- Spec: PS §A3/§B3. `POST /api/attendances` (check-in: `employee_id`, `check_in` defaults to
  `now()` if omitted; a second `POST` for the same employee with no open check-out should PATCH
  the check_out of their most recent open entry rather than create a new row — mirrors a real
  check-in/check-out widget, not two disconnected form submissions). `GET /api/attendances`
  supports `?employee_id=`, `?status=`. `PATCH /api/attendances/:id` is the manual-correction
  path — restricted to `hr_manager`/`hr_payroll_user`/`hr_payroll_manager`/`admin`
  (`authorize()`), sets `is_manual_correction=true` and `corrected_by=req.user.id` automatically
  (never trust a client-sent `corrected_by`). `status` defaults to `'present'` on check-in;
  employees may only `POST`/see their own (`role='employee'` ownership check in controller, same
  pattern as employees/time-off). This data directly feeds T-006's `computeWorkedDays` — right
  now that function only has SQL-fixture data to read, not anything created through the API.
- Acceptance check: `POST /api/attendances` (check-in only) → `201`, `status: 'present'`,
  `check_out: null`. A second `POST` for the same employee same day → `200`, sets `check_out` on
  the existing row (not a new row) and `worked_hours` becomes non-null (generated column).
  `PATCH` as an `employee`-role token → `403`. `PATCH` as `hr_manager` → `200`,
  `is_manual_correction: true`, `corrected_by` set to the caller's id automatically.
- Result/Notes: —

### T-013 — Payslip PDF generation + bulk email delivery (graceful degradation)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/services/pdf.service.js`, `backend/src/services/email.service.js`, `backend/src/controllers/payslips.controller.js` (add the PDF action only — do not touch `list`/`getById`), `backend/src/controllers/payruns.controller.js` (add the send-payslips action only — do not touch existing actions), `backend/src/routes/payslips.routes.js`, `backend/src/routes/payruns.routes.js`, `backend/package.json` (add a PDF lib — `pdfkit` recommended, lightest option — and `nodemailer`)
- Spec: PS §B8 / Section 7 ("Include support for generating Payslip PDFs and facilitating bulk
  email distribution directly from the Payrun workflow" — this is a stated deliverable, not a
  stretch feature). `GET /api/payslips/:id/pdf` streams a PDF built from real `payslip_lines`
  data (employee name, period, the same Basic/Allowances/Deductions/Gross/Net breakdown as the
  JSON detail endpoint — never a separately-hardcoded PDF template with different numbers than
  the API returns). `POST /api/payruns/:id/send-payslips` — for each payslip under the payrun,
  attempt an email via `nodemailer` using `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` from env; **if
  `SMTP_HOST` is unset, do not throw** — set `payslips.email_status = 'queued_no_provider'`
  (column already exists) and log it, per CLAUDE.md's Environment Variables section and pattern 8
  (graceful degradation) — a demo must never 500 because no mail provider is configured. If SMTP
  *is* configured and a send fails, `email_status = 'failed'`; on success, `'sent'`.
- Acceptance check: `GET /api/payslips/:id/pdf` (on an already-computed payslip from T-006's
  fixtures) → `200`, `Content-Type: application/pdf`, non-trivial byte length, and the PDF's
  visible net amount matches the JSON endpoint's net amount exactly. `POST
  /api/payruns/:id/send-payslips` with no `SMTP_HOST` set → `200` (not 500), payslips show
  `email_status: 'queued_no_provider'`.
- Result/Notes: —

### T-014 — Payroll Dashboard aggregation endpoint
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/dashboard.routes.js`, `backend/src/controllers/dashboard.controller.js`, `backend/src/app.js` (uncomment the dashboard mount line only)
- Spec: PS §A7/§B9. `GET /api/dashboard?period_start=&period_end=&department_id=&employee_type=`
  — every number computed live from real rows, filtered by whichever query params are present
  (all optional). Required shape, all via real SQL (DB_GUIDE.md's dashboard query pattern is the
  template — extend it, don't invent a different aggregation style):
  ```
  {
    kpis: { total_net_paid, payslips_generated, average_salary, approved_time_off_days, attendance_health_pct },
    salary_cost_by_department: [{ department, headcount, total_net_cost }],
    monthly_net_salary_trend: [{ month, total_net }],
    payroll_alerts: [{ warning_type, count }],           // GROUP BY on payroll_warnings, resolved=false
    attendance_overview: { present, late, absent, overtime, missing_checkouts },
    time_off_overview: { approved_days, pending_requests },
    department_overview: [{ department, headcount, total_salary }]
  }
  ```
  `attendance_health_pct` = present+late+overtime days / total attendance rows in range, ×100 —
  a real ratio, not a fabricated percentage. Every array/object above must be empty/zero rather
  than error when there's no data yet — an empty dashboard is a valid state (pattern 9).
- Acceptance check: with T-006's test fixtures (one paid payslip, net 54000) in the DB, `GET
  /api/dashboard` → `200`, `kpis.total_net_paid` includes `54000` in its sum (verify against a
  manual `SELECT SUM(...)` you run yourself), `salary_cost_by_department` shows the Engineering
  department with the correct headcount and total. Filtering with a `department_id` that has no
  data → `200` with zeroed/empty fields, not a 500.
- Result/Notes: —

<!-- Add Phase 3+ tasks here once Phase 2 is underway — keep this board to the current + next phase, not the whole roadmap at once, so it stays skimmable. -->
