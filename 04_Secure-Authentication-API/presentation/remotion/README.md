# Presentation (Remotion) — EP 01

A 40-minute, 10-chapter technical presentation video. Structure and per-chapter content
sourcing: `presentation/storyboard.md`. Episode identity: `presentation/youtube/series-manifest.md`.

## Render it

```bash
npm install
npm run render
```

Output: `out/Saffronyx_Secure-Authentication-API_EP01_Full-Technical-Walkthrough.mp4`
(1920×1080, 30fps, 72000 frames). Not committed to git — regenerate from source.

**Verified rendered duration** (not inferred from frame math — checked against the actual file
via `ffprobe`): `2400.000000` seconds = exactly **40:00**. Codec `h264`, `nb_frames=72000`,
`r_frame_rate=30/1`, `1920x1080`.

## Preview / edit interactively

```bash
npm run start
```

Opens Remotion Studio for scrubbing through the timeline and editing scenes live.

## Structure

- `src/theme.ts` — SaffronyxAI.in brand tokens (Obsidian/Saffron/Turmeric Gold/Cream/Off-White),
  same palette as `presentation/html/css/variables.css` and `presentation/pdf-style-guide.md` §2
- `src/SlideFrame.tsx` — shared corporate-deck chrome (brand header, full-width content zone,
  footer with chapter/episode tag) — every content scene wraps this, so layout is consistent
  and content is spread across the canvas rather than crammed into a centered column
- `src/scenes/` — one component per reusable scene type (`ChapterCard`, `CodeScene`,
  `SequenceDetailScene`, `RequirementsScene`, `MetricScene`, `DemoScene`, etc.)
- `src/Presentation.tsx` — the composition: 10 chapters sequenced via `<Series>`, durations
  summing to exactly 72000 frames (see the chapter-budget comment blocks in that file)
- `src/Root.tsx` — composition ID `ep01-secure-authentication-api`, matching the series manifest

## Content Sourcing

Every chapter's content traces to a real project artifact — no invented numbers or claims:

| Chapter | Source |
|---|---|
| 01 Project Introduction | `docs/PRD.md` §1–2 |
| 02 Business Requirements & PRD | `docs/PRD.md` §5 (all 10 FRs) |
| 03 System Architecture | `docs/HLD.md` §1–5 |
| 04 HLD & LLD Design | `docs/LLD.md` (TokenService + RBAC chain) |
| 05 Implementation & Code Walkthrough | Real, unmodified source excerpts |
| 06 Testing, Security & Quality | Re-confirmed test counts, `docs/SECURITY.md` §1–9 |
| 07 End-to-End Demo | `presentation/demo-flow.md` (real captured output, no browser screenshot capability available) |
| 08 Deployment & Operations | `docker-compose.yml`, live-verified in `F1`/`H1` |
| 09 Results, Challenges & Roadmap | `docs/FINAL_PROJECT_AUDIT.md`, `docs/SECURITY.md` §10 |
| 10 Conclusion & Credits | `docs/portfolio/case-study.md` (AI-assisted-work disclosure) |


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
