# PeoplePay360 — HR & Payroll

*The employee record is the hub; contracts, attendance, and time off orbit it; payruns turn all of that into validated, auditable payslips.*

**Odoo Hackathon 2026 · 24-hour build window · Team of 3 (you, Naresh, Parth)**

---

## READ THIS FIRST — the 4-step ritual before touching code

1. **Identify the module** you're touching (Employees / Contracts / Schedules / Attendance /
   Time Off / Salary Structures / Payruns-Payslips / Dashboard / Auth). Every module maps to one
   row in the table reference in [DB_GUIDE.md](DB_GUIDE.md) and one block in the route list in
   [API_GUIDE.md](API_GUIDE.md).
2. **Read the existing file(s)** for that module before writing — the route file, its
   controller, its migration. Don't guess a shape that already exists two files away.
3. **Ask only on a real conflict** — a genuine schema/contract ambiguity this file and
   DB_GUIDE/API_GUIDE don't resolve, or a security-relevant call. Everything else: make the call
   consistent with these pillars and keep moving. If you're a subagent working from
   [chatbot.md](chatbot.md), a real conflict means **stop and write the question into the task
   entry** — don't guess and continue.
4. **Do the task, then report** what's next and what needs wiring — which route/controller/UI
   piece now depends on what you just shipped, and which chatbot.md task (if any) it unblocks.

---

## PRODUCT CONTEXT

Four real pillars, not generic CRUD:

1. **Unified HR hub.** The Employee record is the one place every other record hangs off —
   Contracts, Attendance, Time Off, Allocations are all reached from the Employee Form via
   smart-button counts, never a disconnected top-level list only.
2. **Period-correct contracts.** An employee can have many contracts over time, but a payroll
   run must resolve exactly one — the contract whose date range covers the payrun's period.
   Contracts are never edited in place (see DB_GUIDE's Effective-Dated Records section) — a
   raise is a new contract row, and a Postgres exclusion constraint makes two concurrent active
   contracts for one employee structurally impossible, not just discouraged.
3. **Rule-driven payroll, not a hardcoded formula.** Salary Structures are ordered collections
   of Salary Rules (fixed / percentage / formula, sequenced), and a Payrun's chosen structure is
   what actually drives every payslip line — changing a rule changes future payslips, never past
   ones (payslip lines are frozen at compute time).
4. **Payroll surfaces its own problems.** Before a payrun is finalized, the system proactively
   warns about missing bank details, duplicate payslips (also a DB constraint, not just a
   warning), and employees with no applicable contract — the officer reviews warnings, not bugs.

### Glossary

| Term | Meaning |
|---|---|
| **Payrun** | A batch: a period + a salary structure + a selected set of employees. Produces one Payslip per employee. |
| **Payslip** | One employee's computed pay for one Payrun — a header (status, period, worked days) plus frozen `payslip_lines`. |
| **Salary Structure** | Named, ordered set of Salary Rules (e.g. "Regular Salary"). Assigned on a Contract and chosen on a Payrun. |
| **Salary Rule** | One line of computation logic: category (basic/allowance/gross/deduction/net), sequence, and a computation method (fixed/percentage/formula). |
| **Allocation** | A grant of leave balance to an employee for a Time Off Type, for a validity window. The "taken"/"remaining" are never stored — always summed live from approved Requests (see DB_GUIDE Ledger Pattern). |
| **Time Off Request** | One leave request against (optionally) an Allocation; approving it is the only thing that changes the live balance. |
| **Working Schedule** | A weekly pattern (day/start/end/break) that produces a computed total weekly hours; assigned to employees/contracts. |
| **Warning** | A system-raised issue (missing bank details, duplicate payslip, missing contract) surfaced before a Payrun can be validated. |

---

## ARCHITECTURE AT A GLANCE

- **Backend:** Node.js + Express, plain JS (no build step — speed over ceremony; TS is reserved
  for the frontend where its payoff is highest). `node-pg` for raw parameterized SQL,
  `node-pg-migrate` for migrations. `jsonwebtoken` + `bcrypt` for auth — see API_GUIDE.md.
- **Frontend:** React 18 + Vite + TypeScript + TanStack Query + Zustand + React Hook Form + Zod +
  shadcn/ui + Tailwind. Full stack justified here (not trimmed) — this product has real async
  server-state complexity (payrun wizard, dashboard filters, five status-driven entities) that
  earns TanStack Query + Zustand rather than plain `useState` sprawl.
- **Database:** PostgreSQL, owned schema (see [DB_GUIDE.md](DB_GUIDE.md)) — no ORM, no BaaS.
- **Auth model:** JWT access token (15 min, `HS256` pinned) + httpOnly-cookie refresh token,
  rotated on use, revocable in `refresh_tokens`. Five roles — Employee, HR Manager, HR Payroll
  User, HR Payroll Manager, Admin — enforced by Express middleware (`authorize(...roles)`) plus
  a controller-level ownership check for Employee self-service routes. No forgot-password/OTP
  arc — not a PS requirement, explicitly cut (see Cut Line).
- **Folders:**
  ```
  backend/src/{routes,controllers,services,middleware,db/migrations,utils}
  backend/postman/{collection.json,environment.json}
  frontend/src/{api,components/ui,pages,store,lib}
  docs/{testing,research,screenshots}
  ```

---

## BUILD PHASE ROADMAP (24h)

| Phase | Hours (approx) | Scope |
|---|---|---|
| **0** | 0–3 | Schema + migrations (all tables in DB_GUIDE), auth skeleton (register/login/refresh/JWT middleware/RBAC), empty route files wired into `app.js`, frontend scaffold (Vite+TS+Tailwind+shadcn init, routing shell, auth store), Postman collection skeleton |
| **1** | 3–7 | Employee + Department + Working Schedule CRUD (List/Kanban/Form), employee smart-button counts |
| **2** | 7–10 | Contracts (with the exclusion-constraint guard) + Attendance (check-in/out, manual correction) |
| **3** | 10–14 | Time Off (Types, Allocations, Requests, approve/refuse, live balance queries) |
| **4** | 14–18 | Salary Structures/Rules + Payrun wizard (2-step) + payroll engine (compute/validate/mark-paid) |
| **5** | 18–20 | Payslip PDF generation + bulk email send (graceful degradation if SMTP unset) + Payroll Dashboard (live KPIs/charts) |
| **6** | 20–22 | Polish: empty/loading states everywhere, RBAC-scoped views per role, seed data script, audit log (if time allows) |
| **7** | 22–24 | **Freeze.** Seed real demo data, full manual click-through (log it in `docs/testing/`), rehearse the 5-minute demo, finish README/PITCH |

### CUT LINE

If behind at hour 12 (halfway) or hour ~21.5 (90%), drop in this order — never touch anything
above the line to make room below it:

1. ~~Audit log (Phase 6)~~ — nice-to-have, not scored directly
2. ~~PDF styling polish~~ — a plain, correct PDF beats a pretty one that's late
3. ~~Bulk email delivery~~ — degrade to "queued, would send via SMTP" if provider unset (pattern 8); never block the demo on it
4. ~~Dashboard charts (keep KPI cards, drop the two chart visualizations)~~
5. **Never cut:** the Employee→Contract→Attendance→Time Off→Payrun→Payslip end-to-end path, RBAC, and the ledger-pattern correctness (DB_GUIDE) — these are what the PS and the judging rubric actually score.

I will stop and review this line out loud with you at hour 12 and again at hour ~21.5 — what's shipped, what's at risk, what gets cut. In the final ~1.2 hours (last 5%), no new features — seed data, rehearsal, docs only.

### TIER SYSTEM — what to build after Tier 0, and in what order

**Tier 0 is everything in the phase table above — every PS-mandated module, working end-to-end,
with zero hardcoded data anywhere.** Odoo's own judging process checks this baseline flow first;
differentiators only earn credit once it's flawless. Do not start Tier 1 until Tier 0's full
Employee→Contract→Attendance→Time Off→Payrun→Payslip→Dashboard path actually runs. See
`docs/research/odoo-hackathon-winning-tactics.md` for the sourcing behind this ordering.

- **Tier 1 (build immediately after Tier 0, before anything else):**
  - **Calculation Trace.** The Payslip screen renders every `payslip_lines` row in `sequence`
    order with its rule name/category and the amount it produced — the existing computed data,
    presented as a visible pipeline instead of just a final number. No new backend work.
  - **Payroll Preflight / Health Center.** A dedicated view over `payroll_warnings` (already in
    the schema for this exact purpose — DB_GUIDE.md), grouped by severity, shown before
    Validate/Mark Paid, each warning linking to its source employee/contract/payslip. This is the
    PS's own "surface warnings before finalization" requirement, made visible as a product
    moment instead of a passive list.
- **Tier 2 (only once Tier 0 + Tier 1 are solid and demo-rehearsed):**
  - Audit timeline UI over `audit_logs` (table already designed, see DB_GUIDE.md)
  - "Why did my salary change?" — diff two payslips' `payslip_lines` for one employee, pure
    read-side over existing data
  - Payroll What-If Simulator — **must call the same payroll-engine function** used for real
    computation, in a dry-run mode (no commit, or a discarded scratch payslip) — never a second,
    parallel calculation path that could drift from the real one
- **Tier 3 (explicit risk flag — cut first if time is short, attempt last if very far ahead):**
  - AI natural-language layer over payroll data (needs a real LLM API key/budget + careful
    handling of user-supplied questions against real data — real cost and real risk, not a free
    feature)
  - Attendance/leave "intelligence" (anomaly detection, forecasting) — good product ideas, not
    PS-required
- **Not building, at all:** recruitment, performance management, chat/social features, expense
  management, biometric/facial recognition, a mobile app, jurisdictional tax-compliance logic, or
  an editable visual rule *builder* (Calculation Trace shows the pipeline read-only; a builder is
  a separate UI project the PS doesn't ask for).

---

## SUPERVISOR ↔ SUBAGENT WORKFLOW

**Team reality:** Aryan + Claude Code (supervisor) + Antigravity subagents do all technical
work — schema, backend, frontend, integration. Naresh and Parth are not technical contributors
on this build; their commits (on their own branches, merged after review) are UI redesign passes
and doc/content contributions, not features. chatbot.md tasks are only ever "Supervisor" or
"unclaimed (Antigravity)" — never assigned to Naresh/Parth.

- **Supervisor owns:** reading/scoping the PS, schema and migrations (always hand-authored,
  never delegated), the *design call* behind anything security- or data-sensitive (the auth
  model, RBAC shape, exclusion constraints), reviewing every subagent diff, final integration,
  all git operations.
- **Once a design call is fully specified in a pillar doc, its implementation is a subagent
  task** — including security-adjacent code like the auth controller/middleware. The hard part
  (choosing HS256 + rotation + enumeration-safe responses + httpOnly cookies) is already decided
  and written down in API_GUIDE.md/CLAUDE.md; typing out the Express handlers that follow that
  spec is exactly the "well-specified, wrong guess is cheap to catch" work that belongs to
  Antigravity. Supervisor reviews by running the acceptance check (curl/Postman), not by
  rewriting the code.
- **Subagent (Antigravity) owns:** implementation against a spec already written in
  [chatbot.md](chatbot.md), research (→ `docs/research/`), boilerplate CRUD, seed data,
  repetitive UI, doc drafts, and — per the token-discipline rule above — auth/RBAC
  implementation once specified.
- **Every subagent task ships with a written acceptance check** — a `curl` command, a Postman
  request, a test — in its chatbot.md entry. Never merge blind; run the check yourself before
  marking VERIFIED.
- **Token discipline is explicit policy, not a vague aspiration:** supervisor tokens are the
  scarce resource for a 24-hour non-stop build. Default to writing a chatbot.md task over
  hand-implementing anything the moment the design call is made — including things that feel
  "too important to delegate" like auth, as long as the spec is unambiguous.
- Full task-board mechanics, ownership rules, and escalation policy live in
  [chatbot.md](chatbot.md) — read it before writing or claiming a task.

---

## DEFINITION OF DONE

A feature isn't shipped until every row is true:

| Check | Requirement |
|---|---|
| API layered | route → controller → service, no logic in the route file |
| SQL clean | parameterized, no `SELECT *` |
| Input validated | enum/range/format checked in controller, not just presence |
| Errors handled | `try/catch` → `next(err)` with `err.statusCode` set |
| TypeScript types | defined for every frontend API response/request shape |
| Postman | a real folder+entry added to `backend/postman/collection.json` **and actually run**, not just written |
| Loading state | skeleton shaped like the real content, not a bare spinner |
| Empty state | icon + specific message + CTA in a card |
| Responsive | works on the real target: HR/payroll desk work is desktop-first, but layouts must not break at tablet width (1024px) |
| Logged | `pino.info` on success, `pino.error` on failure, in the controller |
| Committed | conventional message, at the end of the feature — not batched into a giant end-of-phase commit |
| Docs | README or PITCH updated if the change is user-visible |

---

## TESTING STRATEGY

- Postman/newman against `backend/postman/collection.json` for every route, as it's built.
- A full-flow `newman run` at the end of each phase (Phase 1 through 6 in the roadmap above).
- A manual click-through before the demo, logged as a **dated entry** in `docs/testing/` — not
  done silently and forgotten.
- Security-relevant manual checks (rate-limit 429, JWT algorithm pinning, RBAC boundary,
  enumeration-safe auth responses) get their own dated entry in `docs/testing/security-checks.md`
  before Phase 7.

---

## TOKEN EFFICIENCY RULES

- **Reference, don't paste.** Point at `DB_GUIDE.md`/`API_GUIDE.md`/`UI_GUIDE.md` sections by
  name instead of re-explaining schema/contract/design decisions inline.
- **Batch related changes into one chatbot.md task** — one employee-CRUD task, not four
  micro-tasks for list/create/detail/update.
- **Route anything routine to Antigravity by default** — boilerplate CRUD, seed data, repetitive
  UI, research, doc drafts. Supervisor time goes to schema, contracts, security, and review.
- **The 15-minute rule:** during active implementation, doc/process upkeep (updating this
  roadmap, writing chatbot.md tasks, polishing research notes) gets at most ~15 minutes of any
  given hour, unless it's directly unblocking a current failure.
- **Feature freeze / kill switch:** once a real end-to-end path is demoable, resist refactoring
  it further unless the current implementation makes the demo itself impossible (security hole,
  crash, broken core path). Additional time goes to the next slice of scope or to hardening —
  never to rewriting something that already demos correctly.

---

## GIT RULES

- Solo-under-my-name authorship per commit author (each of the three of us commits as
  ourselves) — **never touch git config**, never add a co-author trailer, never add AI
  attribution of any kind to any commit in this repo.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Commit at the end of every phase **and** every shippable vertical slice inside a phase (route +
  controller/service + validation + Postman entry + working UI screen, or the backend-only
  equivalent) — not one commit per file edit, not one giant commit at the end. Frequent commits
  are cheap insurance against losing work to a crash or bad edit with no runway left to recover.
- Branches: `main` (integration, supervisor-merged), `naresh`, `parth` — teammates commit to
  their own branch and open a PR into `main`; supervisor reviews and merges. No remote force-push,
  ever, without explicit sign-off in the moment.
- No remote operations beyond what's already been explicitly authorized (branches created, PRs
  opened/merged) — no new remotes, no repo visibility changes, no deleting branches without asking.

---

## ENVIRONMENT VARIABLES

`backend/.env` (never committed — `.env.example` holds placeholders only):
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
`frontend/.env` (never committed):
```
VITE_API_URL=http://localhost:4000/api
```
When `SMTP_HOST` is unset, `Send Payslips` degrades gracefully (pattern 8): logs the would-be
send and marks payslips `email_status: 'queued_no_provider'` instead of throwing — never a raw
500 in front of judges.
