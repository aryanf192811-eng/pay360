---
name: Radix Enterprise Slate
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#5a5f62'
  on-secondary: '#ffffff'
  secondary-container: '#dce0e4'
  on-secondary-container: '#5e6367'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002113'
  on-tertiary-container: '#009668'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dfe3e7'
  secondary-fixed-dim: '#c3c7cb'
  on-secondary-fixed: '#171c1f'
  on-secondary-fixed-variant: '#43474b'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  stat-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  title-base:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-base:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-medium:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  body-bold:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: '0'
  caption-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 0.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2rem
---

## Brand & Style

This design system delivers an ultra-clean, architectural, and data-dense interface built for high-stakes operational environments such as enterprise payroll, statutory tax compliance, and human resources registries. 

### Brand Personality & Emotional Tone
- **Architectural Rigor:** Eliminates decorative indulgence in favor of hairline precision, structural geometry, and purposeful spatial balance.
- **Uncompromised Trust:** Communicates financial accuracy and legislative adherence (e.g., TDS under Section 192, EPFO, ESIC, PT) through disciplined contrast, stable typographic hierarchies, and micro-elevation.
- **Cognitive Clarity:** Dense ledgers, deep numeric trees, and complex workflows are arranged with maximum signal-to-noise ratio to prevent fatigue during multi-crore disbursement cycles.

### Design Style & Movement
The design movement is **Minimalist / Modern Technical Utility**, directly adopting the composable ergonomics of Radix UI and Tailwind CSS. The interface relies on pure white surfaces layered over subtle slate underlays (`#f8fafc`), defined by crisp 1-pixel linear framing (`#e2e8f0`), restrained typography with negative letter-spacing, and surgical application of functional status cues.

## Colors

The system employs an intentional slate-monochromatic palette paired with tactical semantic accents. Every token conforms to predictable WCAG AA contrast standards over light surfaces.

### Palette Roles & Behavioral Mapping
- **Canvas Base (`#ffffff`)**: Pure white used for primary card surfaces, active table drawers, dropdowns, and sheet backdrops.
- **Canvas Subtle (`#f8fafc`)**: Slate-50 used for the master viewport backdrop, table header rows, and secondary navigation shells.
- **Primary Surface & Ink (`#0f172a`)**: Slate-900 serves as the primary actionable fill (buttons, primary badges) and high-priority titles.
- **Secondary Fill (`#f1f5f9`)**: Slate-100 muted backdrop for secondary interactive triggers, ghost button hover states, and inactive tab tracks.
- **Neutral / Muted Ink (`#64748b`)**: Slate-500 for auxiliary labels, field metadata, input placeholders, breadcrumb dividers, and table column heads.
- **Structural Border (`#e2e8f0`)**: Slate-200 1px hairline boundary separating cards, table cells, form inputs, and split views.
- **Functional Semantics**:
  - **Success (`#10b981`)**: Emerald-500 for compliant payroll runs, verified PAN/UAN statuses, and processed salary registers.
  - **Warning (`#f59e0b`)**: Amber-500 for pending statutory declaration proofs and biometric reconciliations.
  - **Destructive (`#ef4444`)**: Red-500 for salary holds, TDS reconciliation failures, and critical run halts.
  - **Informative (`#0284c7`)**: Sky-600 for legislative policy updates and EPFO ceiling notifications.

## Typography

Typography prioritizes high-legibility sans-serif metrics with precise optical tracking adjustments.

### Type Pairing & Hierarchy Instructions
- **Primary Typeface:** `Geist` (with system fallbacks: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`) anchors all interface copy, titles, and controls.
- **Monospace Financial Treatment:** All currency calculations, IFSC routing codes, permanent account numbers (PAN), universal account numbers (UAN), and employee IDs must employ monospaced tabular numbers via `font-variant-numeric: tabular-nums` or `Geist Mono` / `JetBrains Mono` fallback.
- **Tracking & Proportion:** Headings above 20px enforce negative tracking (`-0.01em` to `-0.025em`) to eliminate loose optical spacing common in large geometric display sizes. Table headers (`label-caps`) utilize `0.05em` tracking with all-caps styling to define structure over dense data matrices.

## Layout & Spacing

The layout model is anchored to an architectural 4px mathematical unit (`0.25rem`), providing strict vertical baseline and horizontal cadence across all enterprise viewports.

### Grid Architecture & Viewport Responsiveness
- **Desktop (≥1024px):** 12-column dynamic fluid grid bounded by standard container boundaries (`max-w-7xl`) or unconstrained edge-to-edge frames (`px-6` or `px-8`) for multi-column payroll ledgers. Gutters are locked at 24px (`space-lg`), with margins set to 32px (`space-xl`).
- **Tablet (768px – 1023px):** 8-column layout with 16px gutters (`space-md`), collapsing wide data grids into horizontally scrollable trays with sticky identifier columns.
- **Mobile (<768px):** 4-column layout with 16px gutters and margins. Form inputs and button targets expand to minimum 44px touch targets.
- **Enterprise Density Calibration:** In high-density modes (e.g., Attendance Ledgers, Monthly Challan Preparation), vertical padding across table rows compresses from `12px` to `6px` or `8px`, allowing over 20 line items within a standard 1080p display viewport.

## Elevation & Depth

Visual depth is achieved through flat planar layering and razor-sharp borders rather than exaggerated vertical shadow drops.

### Elevation Strategy
- **Layer 0 (Canvas):** Master background set to `#f8fafc`. Completely flat, non-elevated.
- **Layer 1 (Cards & Data Panels):** Pure `#ffffff` surface, bounded by a 1px border (`#e2e8f0`) and subtle micro-shadow `shadow-xs` / `shadow-sm` (`0 1px 2px 0 rgb(0 0 0 / 0.05)`).
- **Layer 2 (Dropdowns, Popovers & Context Menus):** Pure `#ffffff` with 1px border (`#e2e8f0`) and `shadow-md` (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`).
- **Layer 3 (Overlays, Sheets & Modals):** Pure `#ffffff` framed by high-depth `shadow-lg` (`0 10px 15px -3px rgb(0 0 0 / 0.1)`) over a semi-transparent muted backdrop (`rgba(15, 23, 42, 0.4)` / `bg-slate-900/40`) with subtle `backdrop-blur-sm`.
- **Keyboard Focus Rings:** Active elements do not rely on shadow expansion; they deploy a 3px ring of Slate-900 (`#0f172a`) at 50% opacity paired with a 1px internal border clearance.

## Shapes

The design system maintains a balanced modern corner geometry (`border-radius: 0.5rem` / `8px` base), reflecting the iconic shadcn/ui aesthetic.

### Shape Language & Radius Distribution
- **Inputs, Buttons, & Dropdown Items (`rounded-md`):** Fixed to `0.375rem` (6px) or `0.5rem` (8px) for crisp containment without visual softness.
- **Panels, Sheets, & Master Cards (`rounded-lg` / `rounded-xl`):** Set to `0.5rem` (8px) or `0.75rem` (12px), creating distinct structural separation against the `#f8fafc` canvas frame.
- **Status Pills & Avatar Indicators (`rounded-full`):** Standard `9999px` geometry reserved for verification statuses, numeric badges, and employee profile initials.

## Components

### Buttons
- **Default (Primary):** Solid `bg-[#0f172a]`, `text-[#f8fafc]`, `h-9 px-4 py-2`, `rounded-md`, `text-sm font-medium`, `hover:bg-[#0f172a]/90`.
- **Secondary:** `bg-[#f1f5f9]`, `text-[#0f172a]`, `h-9 px-4 py-2`, `rounded-md`, `hover:bg-[#f1f5f9]/80`.
- **Outline:** `border border-[#e2e8f0]`, `bg-[#ffffff]`, `text-[#0f172a]`, `shadow-xs`, `hover:bg-[#f1f5f9]`.
- **Ghost:** Transparent background, `text-[#0f172a]`, `hover:bg-[#f1f5f9]`.
- **Destructive:** `bg-[#ef4444]`, `text-[#ffffff]`, `hover:bg-[#ef4444]/90`.
- **Focus:** `focus-visible:ring-2 focus-visible:ring-[#0f172a]/50 focus-visible:outline-none`.

### Input Fields & Form Controls
- **Height & Bounds:** Height 36px (`h-9`), padding `px-3 py-1`, 1px border `#e2e8f0`, background `#ffffff`, `rounded-md`, font size 14px (`text-sm`).
- **Focus:** Border shifts to `#0f172a` with a 3px ring `#0f172a/20`.
- **Labels:** 14px, `font-medium`, `#0f172a`, stacked with a 6px bottom margin.
- **Helper & Validation:** 12px `#64748b` helper captions; errors shift text and border to `#ef4444`.

### Data Tables (Enterprise Payroll Density)
- **Container:** `rounded-lg border border-[#e2e8f0] bg-[#ffffff] overflow-x-auto`.
- **Table Head:** Height 36px, `bg-[#f8fafc]`, bottom border `1px solid #e2e8f0`, text set in `label-caps` (11px uppercase, tracking wide, `#64748b`).
- **Table Row:** Height 40px (standard) or 32px (compact density), bottom border `1px solid #e2e8f0`, hover state `bg-[#f1f5f9]/60`.
- **Numeric Cells:** Right-aligned, set with `font-variant-numeric: tabular-nums` or monospace styling.
- **Sticky Column Support:** Sticky employee identification columns pin to left `0` with pure `#ffffff` background and a subtle right border divider.

### Status Badges & Chips
- **Geometry:** Height 20px–22px, `px-2.5 py-0.5`, `rounded-full` or `rounded-md`, font size 12px (`font-medium`).
- **Compliant / Verified:** Background `#ecfdf5`, text `#047857`, border `1px solid #a7f3d0`.
- **Pending / In Review:** Background `#fffbeb`, text `#b45309`, border `1px solid #fde68a`.
- **Critical / Rejected:** Background `#fef2f2`, text `#b91c1c`, border `1px solid #fecaca`.
- **Neutral / Draft:** Background `#f1f5f9`, text `#334155`, border `1px solid #e2e8f0`.

### Tabs (Segmented & Underline)
- **Segmented Pill (Default):** Track set in `#f1f5f9`, padding `3px`, `rounded-lg`. Triggers use `rounded-md px-3 py-1 text-sm font-medium text-[#64748b] transition-all`. Active state applies `bg-[#ffffff] text-[#0f172a] shadow-xs`.
- **Underline (Editorial):** Borderless background with horizontal `border-b border-[#e2e8f0]`. Triggers display a bottom border `border-b-2 border-transparent pb-3 pt-2 text-sm text-[#64748b]`. Active state applies `border-[#0f172a] text-[#0f172a] font-semibold`.

### Cards & KPI Containers
- **Anatomy:** Header (`p-6 pb-2`), Content (`p-6 pt-0`), Footer (`border-t border-[#e2e8f0] px-6 py-3`).
- **Surface:** `#ffffff` encased in `1px solid #e2e8f0` with `shadow-sm` and `rounded-xl`.
- **KPI Metrics:** Title set in 14px `#64748b`, primary metric in 28px `stat-lg` (`#0f172a`, bold, tabular), footer showing month-over-month delta badge.

### Checkboxes & Radio Controls
- **Geometry:** 16px × 16px square (`rounded-[4px]`) or circle, 1px border `#e2e8f0`.
- **Active State:** Solid `#0f172a` fill with crisp `#ffffff` checkmark icon or radial center dot.