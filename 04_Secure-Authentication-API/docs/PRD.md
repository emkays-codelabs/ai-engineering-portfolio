# Product Requirements Document — Secure Authentication API

**Version**: 1.0 | **Date**: 2026-09-20 | **Author**: Mahesh Kumar | **Tier**: P2

---

## 1. Summary

A JWT-based authentication service built with FastAPI, implementing registration, login
(OAuth2 Password Flow), role-based access control (Admin/User), and refresh-token rotation with
revocation — plus a React frontend for registration, login, and a protected/admin dashboard.
Built as a portfolio/learning submission demonstrating production-grade authentication patterns
that most tutorials skip (refresh-token reuse rejection, server-side-only RBAC, deliberate
token-transport design).

## 2. Problem Statement

`task.md` (the assignment brief) requires a FastAPI application implementing secure
authentication: registration, login, JWT with expiry, bcrypt password hashing, OAuth2 Password
Flow, protected routes, Admin/User role-based access, refresh tokens, and (bonus) logout via
token blacklist — demonstrated in a YouTube walkthrough. Most reference implementations stop at
"login returns a JWT" without addressing what happens when a refresh token is stolen and
replayed, whether a client can self-assign a privileged role, or where the refresh token should
actually live in the browser.

## 3. Target Users

| Persona | Needs | Primary Use Cases |
|---|---|---|
| Developers/reviewers evaluating this submission | See a correct, complete, tested implementation of every required feature | Read the code, run the test suite, watch the demo |
| Anyone using this as a reference implementation | A documented, defensible pattern for JWT auth + RBAC | Copy the token-transport/rotation design (ADR-0002), the RBAC dependency pattern |

## 4. Goals / Non-Goals

**Goals:**
- Implement every feature and security requirement listed in `task.md`, verifiably.
- Every non-trivial decision (JWT library, token transport, refresh-rotation semantics)
  documented with an ADR, not left implicit.
- Full TDD discipline — every behavior has a test that was watched to fail before it was
  watched to pass.
- A real, live-verified demo (Docker + PostgreSQL), not just a passing unit-test suite.

**Non-Goals** (see `CLAUDE.md` Project Identity for the authoritative list):
- Third-party/social OAuth login (Google, GitHub, etc.)
- Email verification or password-reset flows
- Multi-tenant / organization support
- Billing or payments
- Cloud deployment (Docker/local only for this submission)
- Rate limiting, scheduled blacklist cleanup, `SECRET_KEY` rotation, and an admin-provisioning
  endpoint are explicitly out of scope for this submission — disclosed in `docs/SECURITY.md`
  Section 10, not silently omitted.

## 5. Functional Requirements

| # | Requirement | Priority | Acceptance Criteria | Status |
|---|---|---|---|---|
| FR1 | User registration (email + password) | P0 | `POST /auth/register` returns 201 + user (no password hash); duplicate email → 409 | IMPLEMENTED (`C3`) |
| FR2 | Password hashing | P0 | bcrypt via passlib; never stored/logged in plaintext | IMPLEMENTED (`C2`) |
| FR3 | Login via OAuth2 Password Flow | P0 | `POST /auth/login` (form-encoded) returns access token; wrong credentials → 401 | IMPLEMENTED (`C4`) |
| FR4 | JWT access tokens with expiry | P0 | Signed HS256, 15 min default, full claim validation on every protected request | IMPLEMENTED (`C5`) |
| FR5 | Refresh tokens | P0 | 7 day default, rotates on use, replay of a used token rejected | IMPLEMENTED (`C6`) |
| FR6 | Protected routes | P0 | `get_current_user` dependency; missing/invalid token → 401 | IMPLEMENTED (`C7`) |
| FR7 | Admin/User RBAC | P0 | Admin-only route rejects regular users (403); public registration cannot self-assign Admin | IMPLEMENTED (`C7`, `C8`) |
| FR8 | Logout via token blacklist (bonus) | P1 | `POST /auth/logout` revokes the refresh token; idempotent | IMPLEMENTED (`C9`) |
| FR9 | React login/register UI | P1 | Working forms, calls the real API, session persists across reload | IMPLEMENTED (`C10`, `C11`) |
| FR10 | Dockerized deployment | P1 | `docker compose up` runs API + PostgreSQL, migrations apply automatically | IMPLEMENTED (`F1`) |

## 6. Non-Functional Requirements

- **Security**: full JWT claim validation (signature, algorithm, expiry, token type, subject);
  server-side-only RBAC re-verification per request; refresh token never exposed to JS
  (`HttpOnly` cookie). See `docs/SECURITY.md` for the complete control list.
- **Testing**: every behavior test-first (TDD); 101 automated tests (80 backend + 21 frontend),
  all passing as of this document's date.
- **Reproducibility**: exact dependency pins (`uv.lock` for backend), Dockerized deployment with
  pinned base image tags (never `latest`).
- No formal performance/scale targets — this is a submission-sized project, not a
  production service under load; load testing has **not** been performed (stated explicitly,
  not estimated).

## 7. Success Metrics

- All functional requirements above verifiably `IMPLEMENTED`, not just claimed.
- Full test suite green at submission time (`uv run pytest`, `vitest run`).
- Live demo verified against a real Dockerized PostgreSQL stack, not only the SQLite test
  double (see `.claude/project/TASK_TRACKER.md` task `H1`, 14/14 checks passed).
- Every required `task.md` demo scenario (login, invalid login, protected API, JWT, RBAC/
  authorization flow) reproducible on camera for the YouTube submission.

## 8. Open Questions

- Whether the full P2-tier Presentation/Portfolio/Final-Audit deliverables are required for
  this specific submission, or only the core implementation + demo — resolved by explicit user
  direction to proceed with all of them.
- No other open requirements questions remain — scope was fully clarified via the guided
  `project-init` intake before implementation began.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
