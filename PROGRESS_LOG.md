# PROGRESS_LOG.md — Handoff / Continuity Log

**Purpose:** if the supervisor session (Claude Code) runs out of tokens or gets interrupted, a
fresh session (or a human) can read this file top-to-bottom and resume exactly where things
stood — no context lost. Update this after every meaningful milestone: a phase completed, a
subagent task VERIFIED, a strategic decision made, a blocker hit. Newest entry at the top.

Format per entry: `## YYYY-MM-DD HH:MM — <headline>` then bullets: what happened, what's true now,
what's next.

---

## 2026-09-05 (much later) — Full Tier-0 backend push: 10 tasks built/reviewed in one session

**Directive change:** user shifted from "route everything to Antigravity" to "do it yourself
now" — they're managing their own Claude usage budget (was at 36%, plans to resume routing to
Antigravity around 80%) and wants the remaining Tier-0 gaps closed directly by the supervisor
rather than through more delegation round-trips. Antigravity kept working in parallel on its own
already-claimed tasks (T-004, T-013) the whole time — this was **not** a full stop on delegation,
just the supervisor picking up everything else.

**Built and independently verified myself this session (all against the live server + real
Postgres, never just unit-level):**
- **T-008** — Departments + Working Schedules CRUD. `total_weekly_hours` computed server-side
  from `schedule_lines`, never client-trusted (37.5h exact for a 5×8h/30min-break test).
- **T-009** — Employees CRUD + smart buttons. Added a race-safe `employee_code_seq` Postgres
  sequence (migration `1757100000000`) instead of a COUNT-based code. Live contract/time-off/
  attendance-exception counts, department/status/type filters, employee-role ownership boundary.
- **T-010** — Contracts CRUD. Confirmed the exclusion-constraint 409 mapping end-to-end (overlap
  blocked, non-overlap succeeds, clean error message vs. raw Postgres code only in `error.code`).
- **T-011** — Salary Structures + Salary Rules CRUD. Tested all four payroll-adjacent roles for
  real: `hr_manager` gets **zero** access (not even read) per the PS's "no access to payroll
  features," `hr_payroll_user` read-only, `hr_payroll_manager`/`admin` full CRUD.
- **T-012** — Attendance CRUD. This PS-mandated module had **zero code** before this session
  despite T-006 already depending on it. Check-in/check-out correctly merge into the same row
  (confirmed by id, not just by count). Manual correction restricted to HR roles,
  `corrected_by` server-stamped.
- **T-014** — Payroll Dashboard. Also had **zero code and no task** before this session. Every
  KPI/chart is a live query, verified `total_net_paid` against a hand-run `SUM()` in psql
  directly. Found and fixed a real bug myself while building it: filtering attendance/time-off
  overviews by department wasn't wired at all initially (only payslip queries were) — the PS
  explicitly asks for attendance/leave patterns to be department-filterable too, so this would
  have been a silent gap; fixed before calling it done, then hit and fixed an ambiguous-column
  SQL error (`employees.status` vs `attendances.status` colliding after the join).
- **T-005** — reviewed and independently re-verified Antigravity's seed script (ran it twice
  myself, count stable at 12, no duplication).

**Caught a second real defect on independent review (T-004, Postman/newman):** Antigravity's
self-report claimed "34/34 assertions passed." Re-running the exact same command myself — twice
— failed hard across the entire Time Off folder both times. Traced it to the actual root cause
rather than just reporting "it's broken": the collection's `scratch/generate_postman.js` had
baked a `Date.now()` value into the **committed JSON** as a static string
(`"Annual Leave 1788590640224"`), so the suite could only ever pass once, against a virgin
database — every rerun hits a unique-constraint conflict on `time_off_types.name`, and everything
downstream cascades into literal `"{{timeOffTypeId}}"` strings being sent to Postgres as if they
were real UUIDs. Sent back to `NEEDS_REVISION` with the precise fix (use Postman's own
`{{$timestamp}}` dynamic variable inside the request body, evaluated fresh per send, not baked in
by an external script) and a stronger acceptance check (three consecutive runs must all pass, not
just one).

**T-013 (Payslip PDF + bulk email) is mid-flight with Antigravity** — `pdf.service.js`,
`getPdf` on payslips, and `sendPayslips` on payruns all exist in partial form as of this
entry; not yet submitted, not yet reviewed. Do not re-do this work — check chatbot.md's current
T-013 status before touching any of its files.

**What's true right now:**
- Backend Tier 0 is essentially complete except: T-004 needs Antigravity's revision + a
  re-verified 3-in-a-row newman pass; T-013 needs to land and be reviewed. Every other backend
  module in the PS (Auth, Employees, Contracts, Working Schedules, Departments, Attendance, Time
  Off, Salary Structures/Rules, Payruns/Payslips including the calculation engine, Dashboard) is
  built and independently verified against a live server.
- **Frontend is still almost entirely a scaffold** — real screens for every module above still
  need to be built. This is the single largest remaining gap before a demo is possible, bigger
  than anything left on the backend.
- A running list of manual test/dev artifacts now exists in the local Postgres DB (not
  committed anywhere): multiple test users across all 5 roles, Rahul/Priya/Neha as test
  employees, a "Regular Salary" structure with HRA/GROSS/PF/NET rules, several payruns in
  various states, 5 duplicate "Annual Leave ####" time-off types from repeated newman runs. None
  of this is seed data — T-005's seed script is the source of truth for demo data; this is just
  supervisor/Antigravity testing residue and can be wiped before the real demo without concern.

**What's next:** get T-004's revision and T-013 landed and verified, then the frontend build
becomes the critical path — start with screens for whatever's already fully verified on the
backend (Auth login, Employee list/detail, Payroll wizard, Time Off) so there's no backend
dependency blocking frontend progress.

---

## 2026-09-05 (later still) — T-002 caught a real bug on independent review

T-001 VERIFIED (backend skeleton — Express/pool/logger/response utils, reviewed + re-run by
supervisor independently, matches spec exactly). T-002 (auth) was submitted with a thorough
self-report, but supervisor's independent verification (not just reading the diff) found a real
bug: `/register` never runs any auth middleware, so `req.user` is always undefined, so the
"authenticated admin can create privileged-role accounts" path is completely dead — every such
attempt 403s, even from a genuine admin. Proved this by inserting a real admin user via direct
SQL (bcrypt hash matching the service's own `bcrypt.hash(pw,12)`), logging in for a real token,
and calling `/register` with that token — still 403. Sent back to `NEEDS_REVISION` in
chatbot.md with the exact fix (an `optionalAuthenticate` middleware variant that sets `req.user`
if a valid token is present but never rejects the request) and a new acceptance check that covers
the positive case the original check missed. **Lesson reinforced: reading a subagent's diff is
not verification — running the actual scenario is what caught this.** A local test admin user
(`supervisor-admin@test.com` / `AdminPass1!`, role `admin`) now exists in the dev Postgres DB for
continued manual testing — not seed data, not committed anywhere, just a supervisor testing
artifact; T-005's real seed script should still create its own admin properly through whatever
the fixed registration path ends up being.

Local dev environment confirmed working end-to-end for backend testing: Postgres server running
locally, `DATABASE_URL=postgresql://postgres:latent2026@localhost:5432/peoplepay360` (real local
password, in untracked `.env` only), all 20 tables from the migration exist and match DB_GUIDE.md.
Mermaid ER diagram added to DB_GUIDE.md (renders natively on GitHub) instead of a hand-maintained
Excalidraw board, per an explicit user ask to visualize the schema — reasoning: a diagram as text
next to the schema it describes can't drift out of sync the way a separately-maintained drawing
would. Also addressed a user question about switching to Prisma: declined, staying on raw
`node-pg` — nothing in the actual PS mandates an ORM, and Prisma hiding the generated SQL cuts
against the "own the SQL, real technical depth" rationale the whole DB layer was built around.

**What's next:** wait for T-002's revision, verify it the same way (real scenario, not diff
reading), then continue working through T-003 through T-010 as they land — same verification
discipline every time: read the code, then actually run the scenario the acceptance check
describes, including the positive case a spec might not have explicitly called out.

---

## 2026-09-05 (later) — Repo live, gh authenticated, calculation engine queued

- `main`/`naresh`/`parth` all pushed to `https://github.com/aryanf192811-eng/pay360` and tracking
  their remotes. First commit (`597a9bf` "chore: bootstrap project scaffold") is on all three.
- `gh` CLI installed (winget) and authenticated as `aryanf192811-eng` via device-code flow (user
  completed the browser step); `gh auth setup-git` ran, so plain `git push`/`pull` now works
  non-interactively too. **Note for a fresh shell/session:** `gh.exe` is at
  `C:\Program Files\GitHub CLI\gh.exe` — not yet on PATH in already-open shells from before the
  install; new shells should have it automatically via the system PATH winget updated.
- Real Odoo Excalidraw wireframe reviewed (user supplied a screenshot — WebFetch can't render
  Excalidraw's canvas, so this required the image directly). It's a bare gray/white functional
  sketch: plain tables, no color system, no status coloring, generic boxes — confirms the Ledger
  design system (UI_GUIDE.md) is already positioned to be a large visual upgrade, not just a
  different flavor of the same thing. The wireframe's actual *screen inventory* matches what's
  already in API_GUIDE.md's route list and CLAUDE.md's roadmap 1:1 (Login/User Mgmt, Employee+
  Contract, Working Schedule, Attendance (+ a check-in/out "widget" — worth mirroring as a
  small persistent header widget, not just a form), Time Off (Requests/Types/Allocations),
  Payrun wizard (2-step, exactly as speced), Payslip, Salary Structures/Rules, Payroll Dashboard
  with KPI cards + Salary Cost by Department + Monthly Net Salary Trend + Payslip Status/Alerts +
  Attendance Overview + Time Off Overview + Department Overview — all of which DB_GUIDE.md's
  schema already supports with live queries, nothing new needed schema-wise.
- Added **T-006 (Payroll calculation engine)** and **T-007 (Time-off live balance service)** to
  chatbot.md — these are the actual "algorithms" the user asked to prioritize: a real
  sequence-ordered salary-rule evaluator (fixed/percentage/formula, using `mathjs` `evaluate()`
  against a scoped context — explicitly NOT `eval()`/`new Function()` on a stored formula string,
  which would be a code-execution hole on an HR-Payroll-Manager-editable field), contract
  resolution, worked-days computation from attendance+schedule, and the row-locked
  (`SELECT ... FOR UPDATE`) over-allocation guard for leave approval. Both fully specified with
  acceptance checks; neither hand-written by supervisor, per the token-discipline correction.

**What's next:** get T-001/T-002 (backend skeleton + auth) and T-006/T-007 (engine) running via
Antigravity, in that dependency order (engine needs the skeleton+DB connection first). Frontend
scaffold (T-003) can run in parallel since it has no backend dependency yet.

---

## 2026-09-05 — Strategic pivot: Tier system, team roles finalized, log book started

**Decision (user-directed, incorporating external "GPT" strategy review):**
- PS compliance (Tier 0) is built **first and completely**, with zero compromises, before any
  differentiator work starts. Odoo evaluates the required flow first; fancy features only count
  if the baseline is flawless. This was already CLAUDE.md's Cut Line philosophy — now made
  explicit as a hard gate, not just a fallback if behind schedule.
- **Zero hardcoded/static data anywhere, at any point** — every screen, chart, and number is
  either live-computed from Postgres or the direct result of a real user action. Already
  codified in DB_GUIDE.md's Ledger Pattern and CLAUDE.md's dashboard rules; reconfirmed as an
  absolute, not a best-effort.
- **Team roles reset:** Aryan (you) + Claude Code + Antigravity subagents do **all** technical
  work — schema, backend, frontend, integration. Naresh and Parth are **not** technical
  contributors on this build; their commits are UI redesign passes (via Stitch) and doc/content
  contributions on their own branches, merged after review. This replaces the earlier
  three-way "Member 2 / Member 3" ownership split drafted informally — chatbot.md tasks are now
  all either "Supervisor" or "unclaimed (Antigravity)", never assigned to Naresh/Parth.
- **Token discipline tightened:** supervisor (Claude Code) hand-writes only schema/migrations
  and anything genuinely security-sensitive where the design call itself is the hard part.
  Once a design call is made and fully specified in a pillar doc, the *implementation* — even of
  security-adjacent code like the auth controller — goes to Antigravity as a chatbot.md task with
  a curl-based acceptance check, reviewed (not rewritten) by the supervisor. This is a change
  from the first CLAUDE.md draft, which implied the supervisor would hand-write the whole auth
  system; that's now corrected in CLAUDE.md's workflow section.
- Added a Tier system to the roadmap (on top of the existing Cut Line), incorporating the
  strongest ideas from the external strategy review — filtered against what's actually cheap
  because we already built for it:
  - **Tier 1 (build right after Tier 0 core, before anything else):**
    - **Calculation Trace** on the Payslip screen — show each `payslip_lines` row in sequence
      order with its formula/input, not just the final numbers. This is nearly free: the data
      already exists in `payslip_lines` (DB_GUIDE.md), it's a rendering choice, not new backend
      work.
    - **Payroll Preflight / Health Center** — a dedicated view over `payroll_warnings` shown
      before Validate/Mark Paid, grouped by severity, each warning linking to its source record.
      Also nearly free: `payroll_warnings` already exists in the schema for exactly this. This
      directly extends a PS-mandated requirement (surface warnings before finalization) rather
      than adding scope.
  - **Tier 2 (only if Tier 0 + Tier 1 are solid and rehearsed):**
    - Employee/Payroll audit timeline UI (backed by the already-designed `audit_logs` table)
    - "Why did my salary change?" — a diff between two payslips' `payslip_lines` for the same
      employee, pure read-side feature over existing data
    - Payroll What-If Simulator — re-runs the *same* payroll engine function in a dry-run mode
      (no DB writes, or writes to a throwaway scratch payslip that's discarded) — architecturally
      must reuse the real engine, never a parallel fake calculation
  - **Tier 3 (cut unless very far ahead — explicit risk flag):**
    - AI "Copilot" natural-language layer over payroll data — requires a real LLM API key/budget
      and prompt-injection-aware handling of user-supplied questions against real data; explicitly
      the last thing to attempt and the first thing to cut if time is short
    - Attendance/leave "intelligence" (anomaly detection, forecasting) — real product ideas but
      not PS-required; only after Tier 0–2
  - **Explicitly rejected, not building at all:** recruitment, performance management, chat/social
    features, expense management, biometric/facial recognition, mobile app, complex jurisdictional
    tax compliance, a visual drag-and-drop rule *builder* (we show the rule pipeline read-only via
    Calculation Trace — building an editable visual builder is a UI project on its own and isn't
    what the PS asks for).

**What's true right now (state of the repo):**
- All 9 required pillar files exist and are written: `CLAUDE.md`, `API_GUIDE.md`, `DB_GUIDE.md`
  (now includes Ledger Pattern, effective-dated contracts, exclusion-constraint guard, audit log
  design), `UI_GUIDE.md` (Ledger design system — see note below on a pending revision),
  `.mcp.json` (postgres/filesystem/playwright, versions verified against npm, not guessed),
  `chatbot.md` (task board, Phase 0 tasks seeded), `README.md`, `PITCH.md`, `.gitignore` + full
  tracked folder structure (`backend/`, `frontend/`, `docs/{testing,research,screenshots}`).
- `docs/research/odoo-hackathon-winning-tactics.md` written by a research subagent — cited,
  no fabricated sources. Key finding already applied: contracts are effective-dated (new row per
  change, never edited in place) — this was already our design, now confirmed as the right call
  by external research on real payroll-engine failure modes.
- Full Postgres schema written as a single node-pg-migrate migration:
  `backend/src/db/migrations/1757000000000_init-schema.js` — all tables from DB_GUIDE.md,
  including the `no_overlapping_active_contracts` exclusion constraint and the
  `one_payslip_per_employee_per_payrun` unique constraint. **Not yet run against a real
  database** — no `backend/package.json` / migration config exists yet to run it with.
  `psql` client confirmed installed (v18.3) on this machine; no confirmation yet that a Postgres
  *server* is running locally — needs checking before anyone runs `npm run migrate:up`.
- `backend/postman/collection.json` and `environment.json` exist as skeletons (folders per
  domain, no requests yet — T-004 in chatbot.md).
- GitHub CLI (`gh`) was installed via winget mid-session (was missing). **`gh auth login` has
  NOT been run** — PR/merge automation via `gh` is not yet usable until that's done (needs a
  human to complete the browser OAuth flow, can't be done non-interactively).
- No GitHub MCP server is configured or connected in this environment — PR/merge workflow relies
  on `gh` CLI (once authenticated) or the GitHub web UI, not an MCP tool.
- **Git repo has NOT been initialized yet** (`git init` not yet run in this directory). No
  commits exist. No branches (`main`/`naresh`/`parth`) created yet. Remote
  `https://github.com/aryanf192811-eng/pay360.git` confirmed reachable and empty (0 refs) — safe
  to push to without clobbering anything.
- `chatbot.md` T-001 (Express skeleton) is marked VERIFIED but **the actual files
  (`app.js`/`server.js`/`db/pool.js`/`utils/logger.js`) have not been written yet** — this is a
  known inconsistency to fix in the next work session: either write the tiny skeleton now, or
  correct T-001's status back to QUEUED and delegate it too. T-002 (full auth implementation)
  was originally drafted as a subagent task, then supervisor considered hand-writing it, then
  per the token-discipline decision above, **T-002 stays a subagent task** (spec is already
  complete in API_GUIDE.md + CLAUDE.md) — supervisor will verify via curl, not author it.
- **Pending, blocking a full UI_GUIDE revision:** the user referenced "the UI reference given by
  Odoo" (the Excalidraw mockup link embedded in the PDF PS,
  `https://app.excalidraw.com/l/65VNwvy7c4X/17vHpCNFjex`), asking for a design that visibly beats
  it. `WebFetch` cannot render Excalidraw's canvas app (returns only the page shell, no drawing
  content) — the actual mockup content is still unseen. **Next step: ask the user for a
  screenshot/export of that board**, then revise UI_GUIDE.md's layout/component decisions (not
  necessarily the color tokens, which don't depend on Odoo's wireframe) against what it actually
  shows.

**What's next (in order):**
1. Get the Excalidraw mockup content from the user (screenshot or export) and do a short
   UI-differentiation pass noted in UI_GUIDE.md.
2. Fix the T-001 inconsistency — write the minimal Express skeleton files for real (small,
   foundational, needed before anything else can run) OR formally re-queue it for Antigravity.
3. `git init`, first commit ("chore: bootstrap project scaffold") with everything above.
4. Create `naresh` and `parth` branches off `main`, push all three to the confirmed-empty remote.
5. Confirm a local Postgres server is actually running and reachable before anyone runs
   migrations (`psql` client presence isn't proof of a running server).
6. Hand T-002 through T-005 (from chatbot.md) to Antigravity, in file-ownership-safe batches;
   supervisor reviews each via its stated acceptance check before marking VERIFIED.
7. Once Tier 0 (all PS-mandated modules) has a working end-to-end path, build Tier 1
   (Calculation Trace, Payroll Preflight) before anything else.
