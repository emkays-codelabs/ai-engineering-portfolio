# Storyboard — Secure Authentication API

Reviewed against the real project (code, `docs/HLD.md`, `docs/SECURITY.md`, the `H1` live
verification log) before building the Remotion composition. **Runtime target: ~9 minutes**, not
the standard 15–20 — scaled down deliberately per `rules/08-presentation-remotion.md`'s "scale
depth to project complexity" (a single-service auth API doesn't have 15 minutes of genuinely
distinct content; padding it would violate the same no-fabrication spirit that governs claims).

| # | Scene | Section | Duration | Visual | Narration Summary | Verified? |
|---|---|---|---|---|---|---|
| 1 | TitleScene | Cold open | 10s | Project name + one-line hook | "A JWT auth service that implements what most tutorials skip." | — |
| 2 | ProblemScene | Problem | 35s | Text: the 3 unanswered questions (stolen refresh replay, self-assign admin, token storage) | Most auth tutorials stop at "login returns a token" | Yes — `technical-narrative.md` |
| 3 | ArchitectureScene | Architecture | 75s | Animated: React SPA → FastAPI routes → services → repositories → PostgreSQL | Real component diagram from `docs/HLD.md` Section 1 | Yes — HLD diagram |
| 4 | ArchitectureScene | Tech Stack | 30s | Stack table (FastAPI/SQLAlchemy/PyJWT/bcrypt/React/Vite) | Real stack, with ADR links for the two non-obvious choices | Yes — `CLAUDE.md` Identity |
| 5 | WorkflowScene | Core Workflow | 60s | Animated sequence: register → login → protected call → refresh → logout | Real sequence diagram from `docs/HLD.md` Section 3 | Yes — HLD sequence diagrams |
| 6 | CodeScene | Key Implementation Details | 70s | Real code snippets: refresh rotation + reuse-rejection (`token_service.py`), RBAC re-verification (`dependencies.py`) | The two hardest decisions, from `technical-narrative.md` | Yes — real source files |
| 7 | SecurityScene | Security | 45s | Trust-boundary diagram from HLD Section 7 + the transport-split decision | Access token in body, refresh in HttpOnly cookie — why | Yes — ADR-0002, `docs/SECURITY.md` |
| 8 | MetricScene | Testing | 30s | Real counter animation: 80 backend + 21 frontend = 101 tests, all green | Actual `pytest`/`vitest` run counts | Yes — re-run before this build |
| 9 | DashboardScene | Observability | 20s | Real `/health` endpoint JSON response | Readiness check verifies the real DB, not just liveness — full dashboard/metrics explicitly NOT built (disclosed limitation) | Yes — real endpoint response |
| 10 | DemoScene | Live/Demo Walkthrough | 90s | Real captured JSON responses from the `H1` live verification (register → login → protected → refresh → RBAC 403 → logout → post-logout refresh rejected) | Walks the exact `demo-flow.md` sequence | Yes — `demo-flow.md`, real captured output |
| 11 | ComparisonScene | Challenges & Trade-offs | 35s | Before/after: passlib+bcrypt version incompatibility found and fixed | A real bug hit during TDD, not a hypothetical | Yes — `TASK_TRACKER.md` C2 evidence |
| 12 | MetricScene | Results | 25s | Real numbers: 101/101 tests passing, 0 lint errors, Docker stack verified live | No invented metrics — "not yet load-tested" stated explicitly | Yes |
| 13 | TimelineScene | Future Roadmap | 20s | Rate limiting, blacklist cleanup job, key rotation — explicitly marked NOT IMPLEMENTED | Pulled directly from `docs/SECURITY.md` Section 10 | Yes |
| 14 | ClosingScene | Wrap-up | 15s | Summary + repo/README pointer | — | — |

**Sum of durations**: 560s ≈ 9.3 minutes.

## Scenes Explicitly Not Included, and Why

- No separate **Business Context** scene — folded into Problem (this is a learning/portfolio
  submission, not a project with a market/business case per `CLAUDE.md`'s non-goals).
- **DashboardScene** shows only the real `/health` response, not a fabricated metrics dashboard
  — because no observability dashboard was built. Showing an invented one would violate the
  Evidence Hierarchy in `presentation-standard.md`.
- **DemoScene** uses real captured JSON/terminal output rather than browser screenshots — no
  browser-screenshot capability was available when this was built; the alternative (fabricating
  a UI mockup and presenting it as a real screen capture) would violate the no-fabrication rule
  directly, so real API-level evidence was used instead.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
