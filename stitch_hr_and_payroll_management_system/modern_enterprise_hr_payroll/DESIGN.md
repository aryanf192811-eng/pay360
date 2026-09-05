---
name: Modern Enterprise HR & Payroll
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
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#111c2d'
  on-tertiary-container: '#79849a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
  metric-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.03em
  metric-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  margin-mobile: 1rem
  gutter-mobile: 0.75rem
  safe-bottom-action: 5.5rem
---

## Brand & Style

This design system embodies high-trust, mission-critical operational clarity tailored for enterprise HR administrators, executive decision-makers, and employees managing compensation. It synthesizes Modern Corporate precision with crisp, high-velocity Fintech aesthetics.

### Key Tenets
- **Institutional Trust & Rigor:** Conveys absolute security, compliance, and precision required for compensation, statutory benefits, and organizational governance.
- **Cognitive Velocity:** Distills complex tabular pay-runs, multi-tier approvals, and compliance flags into scan-friendly mobile viewports without sacrificing data density.
- **Refined Materiality:** Utilizes clean layered surfaces, micro-borders, and tactile interaction surfaces that inspire confidence in high-stakes workflows (e.g., triggering multi-million dollar payroll disbursements).

## Colors

The palette grounds high-stakes HR governance in deep, structural slates, elevated by modern fintech emerald accents that highlight liquidity, progression, and affirmative actions.

### Palette Roles
- **Primary Deep Slate (`#0F172A`, `#1E293B`):** Establishes structural hierarchy across headers, primary command buttons, deep navigation containers, and prominent balance labels.
- **Secondary Teal Accent (`#0D9488`, `#14B8A6`):** Highlights positive delta indicators, payroll run confirmations, interactive toggles, and primary metric callouts.
- **Neutral & Surface Slates (`#F8FAFC`, `#FFFFFF`, `#F1F5F9`, `#E2E8F0`):** Provides clean separation between modules. `#F8FAFC` serves as the canvas substrate, with `#FFFFFF` elevating active cards and sheets. `#E2E8F0` provides strict architectural hairpins.
- **Semantic Status Spectrum:**
  - **Success (`#10B981`, surface `#ECFDF5`):** Approved time-off, processed disbursements, verified KYC/tax status.
  - **Warning (`#F59E0B`, surface `#FFFBEB`):** Pending approvals, payroll cut-off warnings, unsubmitted expense reports.
  - **Danger (`#EF4444`, surface `#FEF2F2`):** Direct-deposit routing errors, compliance infractions, rejected workflows.
  - **Info (`#3B82F6`, surface `#EFF6FF`):** Benefits enrollment windows, audit trail notices, general notifications.

## Typography

Typography relies entirely on **Hanken Grotesk** across all roles, delivering high-density mechanical legibility with humanist warmth.

### Guidelines
- **Financial Metrics:** Always render numeric aggregates using tabular numerals (`font-feature-settings: "tnum" 1`) to ensure strict column alignment in multi-currency compensation tables.
- **Uppercase Labels:** `label-sm` is reserved for system badges, compliance status, and micro-metric headers (e.g., "GROSS PAY", "YTD WITHHOLDINGS") and must always use uppercase styling with tracking.
- **Hierarchy Control:** Limit screens to a maximum of three typographic levels simultaneously to eliminate visual fatigue in high-information densities.

## Layout & Spacing

The layout is built on a tight 4px baseline sub-grid within an 8px structural layout rhythm, optimized for compact 390px to 428px mobile frames.

### Layout Philosophy
- **Column Architecture:** Fluid single-column mobile view with standard 16px (`margin-mobile`) horizontal gutters. In multi-column metric widgets, use strict 2-column or 3-column equal distribution with 12px (`gutter-mobile`) internal gaps.
- **Vertical Cadence:** Strict separation of card modules using 12px or 16px vertical gaps. Dense data rows inside cards maintain a strict 44px minimum touch target while visual paddings remain compact (8px–12px).
- **Navigation Insets:** Scrollable areas must calculate `safe-bottom-action` (88px) to account for the floating quick-action navigation bar and operating system home indicators.

## Elevation & Depth

Visual hierarchy is communicated through structural layering, ambient slate-tinted drop shadows, and delicate 1px boundary borders. 

### Layer Hierarchy
- **Canvas (Level 0):** Pure `#F8FAFC`. Used for global backgrounds and inactive split containers.
- **Flat Card Surface (Level 1):** `#FFFFFF` paired with an exact 1px solid border (`#E2E8F0`). Flat elevation with zero blur shadow for tabular list rows, line-item breakdowns, and nested data modules.
- **Elevated Interactive Card (Level 2):** `#FFFFFF` paired with an ultra-diffused shadow: `0px 4px 12px -2px rgba(15, 23, 42, 0.06), 0px 1px 2px -1px rgba(15, 23, 42, 0.04)` and a 1px `#E2E8F0` border. Used for primary payroll summary modules, approval queues, and interactive metric cards.
- **Floating Action Deck & Overlays (Level 3):** `#0F172A` (or `#FFFFFF` with glassmorphic backdrop filter `blur(12px)`) with elevation shadow: `0px 12px 32px -4px rgba(15, 23, 42, 0.16), 0px 4px 8px -2px rgba(15, 23, 42, 0.08)`. Used for bottom floating quick actions and action sheets.

## Shapes

The design system implements balanced rounded corners to soften the density of complex enterprise data while maintaining structural seriousness.

### Token Application
- **Base Components (0.5rem / 8px):** Form input fields, segmented control switches, micro-chips, and table inline tags.
- **Containers & Cards (1rem / 16px):** Primary content cards, payroll summary blocks, modal bottom sheets, and dialogue containers.
- **Pill Elements (Full Radius):** Primary floating action buttons (FAB), status badge pills, quick-filter tags, and notification counters.

## Components

### Buttons
- **Primary Action Button:** Background `#0F172A`, text `#FFFFFF`, 48px height, 12px border radius, font `label-lg`. In processing or affirmative state (e.g., "Approve & Submit Batch"), transitions smoothly to `#0D9488`.
- **Secondary Action Button:** Background `#FFFFFF`, 1px solid `#E2E8F0`, text `#1E293B`, hover/active state `#F1F5F9`.
- **Destructive/Reject Button:** Background `#FEF2F2`, border 1px solid `#FEE2E2`, text `#EF4444`.

### Metrics & Dense Financial Cards
- **Payroll Digest Card:** White surface, 16px rounded corners, 1px border `#E2E8F0`. Features a 2-part internal split: primary gross/net amount in `metric-lg` using slate navy `#0F172A`, counterbalanced by an emerald inline sparkline or pay-date countdown badge.
- **Data Pairs:** Stacked key-value rows with label in `body-sm` (`#64748B`) and value in `label-md` (`#0F172A`), separated by subtle 1px border lines (`#F1F5F9`).

### Segmented Controls & Tabs
- Contained within an encased `#F1F5F9` pill container with 6px padding. Active tab features a crisp `#FFFFFF` background with an ambient micro-shadow (`rgba(15, 23, 42, 0.08)`), dark text `#0F172A`, and bold weight. Inactive tabs feature transparent backgrounds with `#64748B` typography.

### Input Fields
- Enclosed with a height of 44px, 8px radius, `#FFFFFF` background, and `#CBD5E1` border. Active/focus state utilizes a crisp 1px ring in `#0D9488` with an emerald tint highlight. Error states turn the border `#EF4444` and present an error caption in `body-sm`.

### Chips & Status Badges
- Pill-shaped with 4px vertical and 10px horizontal padding. Composed of soft pastel backgrounds and high-contrast foreground text:
  - **Disbursed/Approved:** Background `#ECFDF5`, text `#065F46`, dot indicator `#10B981`.
  - **Pending Verification:** Background `#FFFBEB`, text `#92400E`, dot indicator `#F59E0B`.
  - **Action Required:** Background `#FEF2F2`, text `#991B1B`, dot indicator `#EF4444`.

### Floating Navigation & Quick Actions
- Elevated navigation bar suspended 16px above the viewport bottom with 16px lateral inset. Finished with dark slate `#0F172A` with translucent 90% opacity and blur, housing essential destinations alongside a distinct `#0D9488` teal center action button for approving payroll or clocking actions.