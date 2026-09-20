# Storyboard — Secure Authentication API

**Format**: 10 numbered chapters, 40-minute target runtime (per the user-directed presentation
standard for this project — supersedes this file's earlier ~9.3-minute cut, which was a pacing
choice, not a content-scarcity one). Every chapter's content is drawn from a real, existing
project artifact — none of the added depth below is filler; it's the same real material at a
slower, more thorough pace than the earlier highlight-reel cut used.

Reviewed against the real project (code, `docs/PRD.md`, `docs/HLD.md`, `docs/LLD.md`,
`docs/SECURITY.md`, `docs/FINAL_PROJECT_AUDIT.md`, the `H1` live verification log) before
building the Remotion composition and HTML deck.

## Chapter Map

| Ch | Title | Target | Window | Content Source | Verified? |
|---|---|---|---|---|---|
| 01 | Project Introduction | 3 min | 00:00–03:00 | `docs/PRD.md` §1–2, `CLAUDE.md` Project Identity. First 10s: branded Saffronyx open (name + tagline), then problem statement (3 unanswered questions), objectives, target users. | Yes |
| 02 | Business Requirements & PRD | 4 min | 03:00–07:00 | `docs/PRD.md` §3–8: target users table, goals/non-goals, all 10 functional requirements (FR1–FR10) with priority/status, non-functional requirements, success metrics. | Yes — PRD written from real `task.md` + implementation |
| 03 | System Architecture | 5 min | 07:00–12:00 | `docs/HLD.md` §1–5: component diagram (React→FastAPI→services→repositories→PostgreSQL), technology stack table with rationale, external dependencies. | Yes — HLD diagrams |
| 04 | HLD & LLD Design | 5 min | 12:00–17:00 | `docs/LLD.md`: `TokenService` refresh-rotation state machine (interface, sequence, invariants, error handling) and the RBAC dependency chain (interface, sequence, invariants) — the two components with genuine low-level design depth. | Yes — LLD written from real code |
| 05 | Implementation & Code Walkthrough | 7 min | 17:00–24:00 | Real, unmodified excerpts: `models/user.py` (UUIDv7, Role enum), `repositories/user_repository.py`, `services/auth_service.py` (register/authenticate/get_current_user), `services/token_service.py` (issue/refresh/logout), `core/security.py` (JWT encode/decode), `api/v1/endpoints/auth.py` (cookie handling), frontend `AuthContext.tsx` (silent-refresh-on-mount), `ProtectedRoute.tsx`/`AdminRoute.tsx` guards. | Yes — real source files |
| 06 | Testing, Security & Quality | 4 min | 24:00–28:00 | Real counts: 80 backend + 21 frontend = 101 tests, broken down by category (model/repo/service/integration). `docs/SECURITY.md` §1–9 controls. §10's disclosed known limitations (rate limiting, blacklist cleanup, key rotation, admin provisioning, CSRF, ROPC caveat). | Yes — re-run before this build |
| 07 | End-to-End Demo | 5 min | 28:00–33:00 | `presentation/demo-flow.md`'s full 11-step real captured sequence: register → valid login (cookie+CORS) → invalid login → protected API → JWT structure → refresh rotation → RBAC 403 → logout → post-logout refresh rejection. | Yes — real captured JSON from the `H1` live verification against Docker + PostgreSQL |
| 08 | Deployment & Operations | 3 min | 33:00–36:00 | `docker-compose.yml` topology (API + PostgreSQL, healthchecks), `backend/Dockerfile`/`docker-entrypoint.sh` (automatic migrations), `/health` readiness check, `.github/workflows/backend-ci.yml` (disclosed: written and validated, not yet run — no remote existed when authored; now it does). | Yes — live-verified in `F1`/`H1`; CI status disclosed accurately |
| 09 | Results, Challenges & Roadmap | 2 min | 36:00–38:00 | `docs/FINAL_PROJECT_AUDIT.md`: 101/101 tests, 0 lint errors. The real passlib/bcrypt incompatibility found-and-fixed during TDD. `docs/SECURITY.md` §10 roadmap items, all marked NOT IMPLEMENTED. | Yes |
| 10 | Conclusion & Credits | 2 min | 38:00–40:00 | Recap. AI-assisted development disclosure (directed/reviewed AI-paired implementation via Claude Code, per `docs/portfolio/case-study.md`'s Contribution & Ownership section). SaffronyxAI.in branding + tagline + author credit. | — |

**Sum of chapter targets**: 3+4+5+5+7+4+5+3+2+2 = **40 minutes**.

## Branding & Timing Rules Applied

- **Chapter 1**: first 10 seconds reserved for the full Saffronyx branded opening (name +
  tagline), then continues into the project introduction within the same chapter's remaining
  2:50.
- **Chapters 2–9**: consistent chapter title card format (`CH 0X · TITLE`), consistent
  transition style, no repeated full opening animation.
- **Chapter 10**: conclusion + end credits within the final 2 minutes.
- **Brand identity**: SaffronyxAI.in, "Designing Intelligent Systems That Last," using the
  established palette (Obsidian `#050301`, Saffron `#F97316`, Turmeric Gold `#EAB308`, Cream
  `#FDBA74`, Off-White `#FFF7ED`) — same tokens already in `presentation/remotion/src/theme.ts`
  and `presentation/html/css/variables.css`, not redefined.
- **Evidence**: every chapter's "Verified?" column traces to a specific real artifact — no
  invented metrics, no simulated screens presented as real.

## Runtime Validation

Timing above is a proposed 40-minute allocation, not an assumption of actual runtime. Since
this is a Remotion motion-graphics video with no recorded voice narration (text/diagram-driven,
not a synced voiceover), the rendered file's duration is set directly by `durationInFrames`
(72000 frames at 30fps = exactly 2400s = 40:00) — there is no separate "actual spoken timing"
to diverge from it, unlike a narrated video. The rendered output's actual duration is verified
via `ffprobe` after rendering (see `presentation/remotion/README.md`), not inferred from slide
count or frame-budget arithmetic alone.

For the HTML deck (self-paced, viewer-controlled navigation, not a fixed-duration video), the
40-minute figure is a **narration-script pacing target** for a presenter walking through it live
— the deck itself has no enforced runtime, consistent with how a slide deck genuinely works.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
