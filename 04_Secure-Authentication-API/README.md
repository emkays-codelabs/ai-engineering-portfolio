# Secure Authentication API

> A production-grade JWT authentication service for FastAPI — registration, login,
> role-based access control, and refresh-token rotation — with a React login/register UI.

**Status**: In Development | **Version**: 0.1.0

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. Solution](#3-solution)
- [4. Key Features](#4-key-features)
- [5. Architecture](#5-architecture)
- [6. Technology Stack](#6-technology-stack)
- [7. Core Workflow](#7-core-workflow)
- [8. Project Structure](#8-project-structure)
- [9. Getting Started](#9-getting-started)
- [10. Configuration](#10-configuration)
- [11. API](#11-api)
- [12. Testing](#12-testing)
- [13. Security](#13-security)
- [14. Deployment](#14-deployment)
- [15. Demo](#15-demo)
- [16. Documentation](#16-documentation)
- [17. Known Limitations](#17-known-limitations)
- [18. Roadmap](#18-roadmap)
- [19. Author & Ownership](#19-author--ownership)

**Navigation:** [Overview](#1-overview) · [Architecture](#5-architecture) ·
[Getting Started](#9-getting-started) · [Testing](#12-testing) ·
[Deployment](#14-deployment) · [Documentation](#16-documentation)

---

## 1. Overview

A self-contained authentication reference service: FastAPI backend issuing short-lived JWT
access tokens and rotating, revocable refresh tokens, with Admin/User role-based access control,
plus a React frontend for registration, login, and a protected/admin dashboard.

### 1.1 Key Capabilities
- User registration and login (OAuth2 Password Flow)
- JWT access tokens (15 min default) + refresh tokens (7 day default) with rotation and
  reuse-rejection
- Admin/User role-based access control, enforced server-side only
- Logout via token blacklist (insert-only revocation log)
- React login/register UI with session persistence across reloads

[↑ Back to Table of Contents](#table-of-contents)

## 2. Problem Statement

Most auth tutorials stop at "login returns a JWT." This project implements the parts that are
usually skipped: refresh-token rotation with reuse detection, server-side-only role enforcement
(a client can't self-assign Admin), and a documented, deliberate token-transport strategy
(access token in the response body, refresh token in an `HttpOnly` cookie) rather than storing
both in `localStorage`.

[↑ Back to Table of Contents](#table-of-contents)

## 3. Solution

FastAPI + SQLAlchemy + PostgreSQL backend, layered as `api/ → services/ → repositories/`
(`rules/15-backend-structure.md`). Every architectural decision that isn't self-evident from the
code is written down: [docs/HLD.md](docs/HLD.md) for the system design,
[adr/0001-jwt-library-choice.md](adr/0001-jwt-library-choice.md) and
[adr/0002-token-transport-and-refresh-rotation.md](adr/0002-token-transport-and-refresh-rotation.md)
for the two decisions that shape the token endpoints' contracts.

[↑ Back to Table of Contents](#table-of-contents)

## 4. Key Features

| Feature | Description | Status |
|---|---|---|
| Registration | Email + password, bcrypt-hashed, 8–72 char password | IMPLEMENTED |
| Login | OAuth2 Password Flow, Swagger/curl/Postman-testable | IMPLEMENTED |
| JWT access tokens | HS256, 15 min default, full claim validation (sig/alg/exp/type/sub) | IMPLEMENTED |
| Refresh tokens | HttpOnly/Secure/SameSite=Strict cookie, rotation + reuse-rejection | IMPLEMENTED |
| RBAC | Admin/User, server-side re-verified per request, no self-assign | IMPLEMENTED |
| Logout | Token blacklist, lenient/idempotent | IMPLEMENTED |
| Admin route | `GET /admin/users` — lists all users | IMPLEMENTED |
| React frontend | Login/register forms, protected dashboard, admin page | IMPLEMENTED |
| Dockerized | API + PostgreSQL via `docker-compose.yml`, verified live | IMPLEMENTED |
| CI | GitHub Actions (lint + test + Docker build) | IMPLEMENTED — not yet run (no remote configured) |
| Rate limiting | Login/register/refresh throttling | NOT IMPLEMENTED — see [docs/SECURITY.md](docs/SECURITY.md) |
| Blacklist cleanup job | Prune expired `token_blacklist` rows | NOT IMPLEMENTED — see [docs/SECURITY.md](docs/SECURITY.md) |

[↑ Back to Table of Contents](#table-of-contents)

## 5. Architecture

React SPA → FastAPI (`api/v1/` routes → `services/` → `repositories/`) → PostgreSQL. Full
diagrams (component + two sequence diagrams) and the security/trust-boundary breakdown are in
[docs/HLD.md](docs/HLD.md) — not duplicated here per `rules/06-documentation.md`.

[↑ Back to Table of Contents](#table-of-contents)

## 6. Technology Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic |
| Security | bcrypt (passlib), PyJWT, OAuth2 Password Flow |
| Frontend | React 18, TypeScript, Vite, React Router 7 |
| Database | PostgreSQL 16 (deploy), SQLite (test) |
| Testing | Pytest + HTTPX (backend), Vitest + React Testing Library (frontend) |
| Infrastructure | Docker + Docker Compose, GitHub Actions |
| Dependency management | `uv` (backend, `pyproject.toml` + `uv.lock`), `npm` (frontend) |

[↑ Back to Table of Contents](#table-of-contents)

## 7. Core Workflow

```text
Register  →  Login (OAuth2 Password Flow)  →  access_token (body) + refresh_token (cookie)
   ↓
Call protected route with "Authorization: Bearer <access_token>"
   ↓
Access token expires (15 min)  →  POST /auth/refresh (cookie)  →  new pair, old one revoked
   ↓
Logout  →  refresh token's jti blacklisted, cookie cleared
```

[↑ Back to Table of Contents](#table-of-contents)

## 8. Project Structure

```text
01_Secure-Authentication-API/
├── backend/
│   ├── app/                  # FastAPI app (api/, services/, repositories/, models/, schemas/, core/)
│   ├── tests/                # 82 tests: unit/ + integration/
│   ├── migrations/           # Alembic (upgrade + downgrade verified)
│   ├── Dockerfile, docker-entrypoint.sh
│   └── pyproject.toml, uv.lock
├── frontend/
│   └── src/                  # React app (features/, routes/, services/, hooks/, types/)
│       └── tests/            # 21 tests (Vitest + React Testing Library)
├── docs/                     # HLD, API_SPEC, SECURITY (this project's filled-in docs)
├── adr/                      # Architecture Decision Records
├── docker-compose.yml
└── .github/workflows/        # CI (lint + test + Docker build)
```

Full generated tree: [PROJECT_TREE.md](PROJECT_TREE.md).

[↑ Back to Table of Contents](#table-of-contents)

## 9. Getting Started

### 9.1 Prerequisites
- Docker + Docker Compose (simplest path), **or** Python 3.12 + [`uv`](https://docs.astral.sh/uv/) and Node.js 20+ for running backend/frontend separately.

### 9.2 Installation & Run — Docker (recommended)

Create `backend/.env` (see `backend/.env.example` for the schema), then from the repository root:

```bash
docker compose up --build
```

API at `http://localhost:8000` (Swagger UI at `/docs`), PostgreSQL on `5432`. Migrations run
automatically on container startup (`docker-entrypoint.sh`).

### 9.3 Run Locally (without Docker)

Backend, from `backend/`:
```bash
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Frontend, from `frontend/`:
```bash
npm install
npm run dev
```

Frontend dev server: `http://localhost:5173`.

[↑ Back to Table of Contents](#table-of-contents)

## 10. Configuration

### 10.1 Environment Variables (backend — see `backend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLAlchemy connection string (Postgres in deploy, SQLite in tests) |
| `SECRET_KEY` | Yes | JWT signing key — no default, fails fast if missing |
| `ALGORITHM` | No (default `HS256`) | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No (default `15`) | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No (default `7`) | Refresh token lifetime |
| `ENVIRONMENT` | No (default `development`) | Controls the refresh cookie's `Secure` flag |
| `FRONTEND_ORIGIN` | No (default `http://localhost:5173`) | CORS allowed origin (single, explicit — never a wildcard) |

### 10.2 Environment Variables (frontend — see `frontend/.env.example`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No (default `http://localhost:8000`) | Backend base URL |

[↑ Back to Table of Contents](#table-of-contents)

## 11. API

Full endpoint reference: [docs/API_SPEC.md](docs/API_SPEC.md). Interactive Swagger UI at `/docs`
when the API is running.

[↑ Back to Table of Contents](#table-of-contents)

## 12. Testing

Backend, from `backend/`:
```bash
uv run pytest tests/ -v
uv run ruff check .
```

Frontend, from `frontend/`:
```bash
npx vitest run
npx tsc -b && npx vite build
```

### 12.1 Test Results (actually run, not estimated)

- **Backend**: 82/82 passed (`uv run pytest`), `ruff check .` clean.
- **Frontend**: 21/21 passed (`vitest run`), TypeScript build clean (`tsc -b`), production
  build succeeds (`vite build`), 0 ESLint errors (1 non-blocking HMR-related warning).
- **Docker**: full stack (`docker compose up --build`) verified live — migrations ran against
  real PostgreSQL, and a complete manual flow (register → login → protected route → refresh →
  logout → invalid-login-rejected) was exercised against the running containers.

[↑ Back to Table of Contents](#table-of-contents)

## 13. Security

Summary: passwords hashed with bcrypt; JWTs fully validated (signature, algorithm, expiry, token
type); refresh tokens rotate with reuse-rejection; RBAC is enforced server-side only, and public
registration cannot self-assign the Admin role. Full review, including explicitly disclosed known
limitations (no rate limiting, no blacklist cleanup job, no key rotation): [docs/SECURITY.md](docs/SECURITY.md).

[↑ Back to Table of Contents](#table-of-contents)

## 14. Deployment

Local/Docker only for this project — see [docker-compose.yml](docker-compose.yml). No cloud
deployment target (explicit non-goal — see `CLAUDE.md` Project Identity).

[↑ Back to Table of Contents](#table-of-contents)

## 15. Demo

Manual demo verification checklist and walkthrough: see task `H1` in
`.claude/project/TASK_TRACKER.md`. YouTube recording is a separate, user-performed step (`H2`).

[↑ Back to Table of Contents](#table-of-contents)

## 16. Documentation

| Document | Description | Location |
|---|---|---|
| PRD | Functional requirements, traced to task IDs | [docs/PRD.md](docs/PRD.md) |
| HLD | System architecture, diagrams, trust boundaries | [docs/HLD.md](docs/HLD.md) |
| LLD | Low-level design — token rotation state machine, RBAC dependency chain | [docs/LLD.md](docs/LLD.md) |
| API Spec | Full endpoint reference | [docs/API_SPEC.md](docs/API_SPEC.md) |
| Security Review | Controls implemented + disclosed limitations | [docs/SECURITY.md](docs/SECURITY.md) |
| ADR-0001 | JWT library choice | [adr/0001-jwt-library-choice.md](adr/0001-jwt-library-choice.md) |
| ADR-0002 | Token transport & refresh-rotation strategy | [adr/0002-token-transport-and-refresh-rotation.md](adr/0002-token-transport-and-refresh-rotation.md) |
| Presentation (video) | EP 01 — 10-chapter, 40-minute Remotion video. **Rendered output is stale**: rendered before 3 on-screen clarifications were added to source; re-render intentionally on hold (see §17). | `presentation/remotion/` — local only, not in this git repo (see note below) |
| Presentation (HTML deck) | EP 01 — 20-slide single self-contained HTML file (no build step, no external references) | `presentation/html/Secure Authentication API.html` — local only, not in this git repo |
| YouTube episode manifest | Single-episode (EP 01) series manifest, naming convention | `presentation/youtube/series-manifest.md` — local only, not in this git repo |
| Final Project Audit | 13-category gate-10 audit, disclosed gaps + next steps | [docs/FINAL_PROJECT_AUDIT.md](docs/FINAL_PROJECT_AUDIT.md) |
| Task Board | Full task history with verification evidence per task | `.claude/project/TASK_TRACKER.md` |

> **Note**: `presentation/` is intentionally excluded from this git repository (`.gitignore`) —
> treated as local reference/build output, not versioned application source. The files above
> exist on the machine this project was built on but will not be present in a fresh clone.

[↑ Back to Table of Contents](#table-of-contents)

## 17. Known Limitations

- No rate limiting on `/auth/login`, `/auth/register`, `/auth/refresh`.
- No scheduled cleanup of expired `token_blacklist` rows.
- No admin-provisioning endpoint — promoting a user to Admin requires direct DB access.
- No `SECRET_KEY` rotation mechanism.
- CSRF mitigation relies on `SameSite=Strict` alone (no explicit CSRF token) — acceptable for
  this project's single-origin scope, not for a multi-origin production deployment.
- OAuth2 Resource Owner Password Credentials flow is used because `task.md` requires it — not
  recommended for new production OAuth deployments (see [docs/SECURITY.md](docs/SECURITY.md) Section 8).
- The rendered Remotion video (`presentation/remotion/out/`) predates 3 on-screen clarifications
  added to its own scene source (OAuth2 ROPC caveat, logout-revocation scope, cookie/CSRF
  detail) — the source is current, the rendered `.mp4` is not yet. Re-render is deliberately
  held pending explicit go-ahead, not forgotten.

Full detail and rationale for each: [docs/SECURITY.md](docs/SECURITY.md) Section 10.

[↑ Back to Table of Contents](#table-of-contents)

## 18. Roadmap

- [x] Manual end-to-end demo verification (`H1`)
- [x] Remotion presentation video, 10-chapter/40-min (`I1`) — rendered `.mp4` is stale relative
      to source; re-render on hold pending explicit go-ahead
- [x] Management HTML presentation deck, 20-slide single-file (`I2`)
- [x] Refresh-token rotation concurrency fix — closed a race window an external review flagged
      (`backend/app/repositories/token_repository.py`, `backend/app/services/token_service.py`)
- [ ] Re-render the Remotion video with its current, clarification-updated source
- [ ] YouTube demo recording (`H2` — user action)
- [ ] Submission (`H3` — user action)
- [x] Final project audit (`docs/FINAL_PROJECT_AUDIT.md`)
- [x] Portfolio case study / resume material (`docs/portfolio/`)

[↑ Back to Table of Contents](#table-of-contents)

## 19. Author & Ownership

**Mahesh Kumar**, Founder & CEO, SaffronyxAI.in

[↑ Back to Table of Contents](#table-of-contents)

---

### © 2026 SaffronyxAI.in

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.
All Rights Reserved. Third-party components remain subject to their own licenses.
