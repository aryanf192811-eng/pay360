# DESIGN.md — superseded

This file previously documented a cream/blue palette (`#faf6dc` / `#3062e1`) that was never
actually wired into `frontend/src/index.css`'s CSS variables — it only existed hardcoded inline
in `Landing.tsx`, diverging from the real token system. That created two conflicting design
systems on disk at once.

**`UI_GUIDE.md` is the single canonical design system.** Its "Ledger" token table is what
`frontend/src/index.css` now implements exactly. If you're making a design decision, start there.
