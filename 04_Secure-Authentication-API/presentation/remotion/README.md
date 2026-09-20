# Presentation (Remotion)

A ~9.3 minute technical presentation video, per `presentation/storyboard.md` — scaled down from
the standard 15–20 min target deliberately (see the storyboard's own note on why).

## Render it

```bash
npm install
npm run render
```

Output: `out/presentation.mp4` (1920×1080, 30fps, 16800 frames). Not committed to git — see
the repo root `.gitignore` — regenerate from source.

## Preview / edit interactively

```bash
npm run start
```

Opens Remotion Studio for scrubbing through the timeline and editing scenes live.

## Structure

- `src/theme.ts` — shared colors/typography, imported by every scene (no per-scene restyling)
- `src/scenes/` — one component per reusable scene type, per `.claude/presentation/scene-template.md`
- `src/Presentation.tsx` — the composition, sequencing scenes via `<Series>` with durations matching `storyboard.md`
- `src/Root.tsx` / `src/index.ts` — Remotion registration boilerplate

## Content Sourcing

Every scene's content traces to a real project artifact — no invented numbers or claims:
- `DemoScene` — real captured JSON responses from `presentation/demo-flow.md` (a live run
  against Docker + PostgreSQL), not a browser screenshot (none was available to capture)
- `MetricScene` (Testing/Results) — real `pytest`/`vitest` counts, re-confirmed before this
  build
- `CodeScene` — real, unmodified excerpts from `backend/app/services/token_service.py` and
  `backend/app/core/dependencies.py`
- `ArchitectureScene`/`WorkflowScene` — mirrors the real diagrams in `docs/HLD.md`


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
