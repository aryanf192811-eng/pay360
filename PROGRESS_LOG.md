# PROGRESS_LOG.md — Handoff / Continuity Log

**Purpose:** if the supervisor session (Claude Code) runs out of tokens or gets interrupted, a
fresh session (or a human) can read this file top-to-bottom and resume exactly where things
stood — no context lost. Update this after every meaningful milestone: a phase completed, a
subagent task VERIFIED, a strategic decision made, a blocker hit. Newest entry at the top.

Format per entry: `## YYYY-MM-DD HH:MM — <headline>` then bullets: what happened, what's true now,
what's next.

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
