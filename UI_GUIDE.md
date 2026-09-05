# UI_GUIDE.md — PeoplePay360 Design System

> Note on process: the brief calls for invoking a "ui-ux-pro-max" skill before setting this
> file's direction. That skill is not present in this environment's skill list — it does not
> exist to invoke. The direction below was instead chosen deliberately against the product's
> actual category (enterprise payroll/HR, trust + precision over playfulness) and audience
> (HR/payroll officers doing repetitive, high-stakes data work all day), and explicitly avoids
> reusing a stock amber/emerald SaaS palette so the product doesn't read as a generic template.

## Identity: "Ledger"

Payroll software's core promise is *trustworthy arithmetic, presented calmly*. The palette
leans cool and ink-like (like a financial ledger book) with one warm, unmistakable accent used
only for primary actions — so it never gets confused with a status color.

Revised after reviewing a teammate's (Naresh) independent design pass: adopted the real Odoo
brand pair (aubergine purple + teal) in place of the original indigo/copper choice — genuinely
distinctive, and more on-brand for an *Odoo* Hackathon build than an invented pair. Only the two
identity tokens changed; the semantic colors and the "status colors stay standard-hued" rule
below are unchanged.

### Color Tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F8FAFC` | `#0E0F14` | page background |
| `--surface` | `#FFFFFF` | `#171922` | cards, tables, modals |
| `--surface-raised` | `#FFFFFF` (shadow) | `#1E212C` | popovers, dropdowns |
| `--border` | `#E2E8F0` | `#2A2D3A` | dividers, table borders |
| `--text` | `#0F172A` | `#EDEDF4` | primary text |
| `--text-muted` | `#64748B` | `#9497AC` | secondary text, labels |
| `--primary` | `#714B67` (Odoo Purple) | `#6C70E0` | primary actions, active nav, links |
| `--primary-hover` | `#5C3D54` | `#8285E8` | hover/pressed |
| `--accent` | `#00A09D` (Odoo Teal) | `#F0855F` | rare: a single hero CTA per screen, never repeated for status |
| `--success` | `#16A34A` | `#3FBE87` | paid, approved, present |
| `--warning` | `#D97706` | `#E0A83A` | pending, late, review-needed |
| `--danger` | `#DC2626` | `#E86868` | refused, absent, blocking error |
| `--info` | `#2563EB` | `#5FA8D8` | neutral informational badges |

Semantic colors (success/warning/danger) are intentionally standard-hued — status colors should
be instantly legible, not stylized. The identity lives in `--primary`/`--accent`, not there.

### Typography

- Font: **Inter** (UI text) + **IBM Plex Mono** (numbers only — every wage, hours, and salary
  figure in the app renders in the mono face, tabular-nums, so columns of money align visually —
  a small detail that reads as "real financial software" to anyone who's used one).
- Scale: `12 / 13 / 14 / 16 / 20 / 24 / 32` px, line-height `1.4` body / `1.2` headings.
- Weight: 400 body, 500 labels/table headers, 600 headings, 700 KPI numbers only.

### Spacing & Radius

- Spacing scale (px): `4 8 12 16 24 32 48 64` — use the scale, never an arbitrary value.
- Radius: `6px` inputs/buttons, `10px` cards, `999px` pills/badges/avatars.
- Shadows (elevation): `sm` = `0 1px 2px rgba(0,0,0,.06)` (cards), `md` = `0 4px 12px rgba(0,0,0,.10)`
  (dropdowns/popovers), `lg` = `0 12px 32px rgba(0,0,0,.16)` (modals). Dark mode swaps alpha to
  `.4/.5/.6` — dark surfaces need darker, not lighter, shadows to read as elevated.

### Motion

- 150ms ease-out for hover/press states, 200ms ease-in-out for panel/drawer open, 120ms for
  toast enter. No motion on data changing value (a KPI updating after a mutation) beyond a
  single 300ms color-flash on the changed cell — this is the "watch it update live" moment
  (pattern 10) and it should be noticeable without being distracting.

## Component Composition Rule

shadcn/ui is the base primitive layer only. Every shadcn component gets wrapped in a named
PeoplePay360 component before use in a page (`<StatusBadge>`, `<KpiCard>`, `<DataTable>`,
`<WizardStepper>`) — **never edit files under `components/ui/` directly**; if a shadcn primitive
needs different behavior, wrap it, don't fork it.

## State Management Table

| State kind | Tool | Example |
|---|---|---|
| Server state (anything from the API) | TanStack Query | employee list, payslip lines, dashboard KPIs |
| Small global client state | Zustand | logged-in user + role, active payrun-wizard step, sidebar collapsed |
| Forms | React Hook Form + Zod | employee form, contract form, payrun wizard steps |
| Ephemeral UI state | `useState` | dropdown open/closed, hovered row, local input focus |

Server responses never get copied into Zustand — a Zustand store holding a stale employee list
next to TanStack Query's cached one is exactly the kind of drift the Ledger Pattern in
DB_GUIDE.md exists to prevent, and it applies to the frontend too.

## Anti-Patterns (reviewed against on every PR)

- No `localStorage`/`sessionStorage` for anything that is React state or belongs in a store —
  the access token pair is the one exception (refresh token lives in an httpOnly cookie set by
  the server, never in storage at all; the short-lived access token may live in memory/Zustand,
  never `localStorage`).
- No inline `style={{ ... }}` — use Tailwind classes or a CSS var from the token table above.
- No API calls inside a component body — always through a `useQuery`/`useMutation` hook
  (API_GUIDE.md frontend layer rule).
- No component library outside shadcn/ui without a stated reason written in the PR/commit.
- No spinner-only loading state — every list/data view gets a skeleton shaped like its real
  content (pattern 9), and every empty list gets an icon + specific message + CTA in a card,
  never a bare icon on blank white.
- No status rendered as free text — every status (contract/attendance/leave/payrun/payslip) goes
  through `<StatusBadge status="..." domain="..." />`, which maps to one fixed color per status
  per the semantic tokens above — never an ad hoc color chosen per screen.
