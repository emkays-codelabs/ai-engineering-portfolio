# Project Profile — Secure Authentication API

**Problem**: Most "add JWT auth" reference implementations stop at issuing a token and skip the
parts that actually matter for security: refresh-token reuse detection, server-side-only role
enforcement, and a defensible decision about where tokens live in the browser.

**Role**: Directed and reviewed an AI-paired implementation (Claude Code) — made the
architecture and technology decisions (token-transport strategy, dependency-management
approach, Docker vs. frontend sequencing, stack confirmations), reviewed and corrected the
AI's work at each step (e.g. requiring the ADR backfill when architecture docs were skipped,
catching that a claimed CORS implementation didn't yet exist), and owns the final, verified
submission. Implementation code was AI-generated under this direction and test-driven
discipline, not hand-typed line-by-line.

**Contribution**: Scoped the project via a guided intake, made the calls on tier (P2),
archetype, and stack; directed a strict TDD workflow for all implementation; caught and
required fixes for process gaps (skipped architecture phase, missing PRD/LLD, an
unimplemented feature claimed as done); verified every deliverable live rather than accepting
"tests pass" as sufficient — including a real Docker deployment and a scripted 14-point
end-to-end check against the running stack.

**Stack**: FastAPI, SQLAlchemy 2.0, PostgreSQL, Alembic, PyJWT, bcrypt · React 18, TypeScript,
Vite, React Router · Docker, GitHub Actions · Pytest/HTTPX, Vitest/React Testing Library.

**Outcome**: 101/101 automated tests passing (80 backend, 21 frontend), a live-verified
Docker deployment, full documentation trail (PRD → HLD/LLD → ADRs → API spec → security
review → final audit), and both a rendered video presentation and an interactive HTML deck —
all traceable to real code and real test runs, with every known limitation disclosed rather
than hidden.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
