# LinkedIn Summary — Secure Authentication API

Built (via directed, reviewed AI-paired development with Claude Code) a JWT authentication
service that goes past the "login returns a token" tutorial pattern most reference
implementations stop at.

The interesting part isn't that it does auth — it's the decisions behind it, each written
down before the code: what happens when a stolen refresh token gets replayed (rotation +
reuse-rejection, verified by a test that rotates once then replays the original and confirms
it's rejected); whether a client can self-assign the Admin role (structurally impossible — the
registration schema has no role field); and where the refresh token actually lives in the
browser (an HttpOnly cookie, never JavaScript-readable localStorage — documented in an ADR,
not an unstated default).

Stack: FastAPI + SQLAlchemy + PostgreSQL on the backend, React + TypeScript on the frontend,
Docker for deployment. Built entirely test-first — 101 automated tests, all green — and
verified live against a real Dockerized PostgreSQL instance, not just a passing unit-test
suite. Full documentation trail (requirements → architecture → ADRs → API spec → security
review → final audit) with every claim traced to a real test run, and every known limitation
(no rate limiting, no scheduled token-cleanup job, no key rotation) disclosed rather than
glossed over.

#FastAPI #React #JWT #SoftwareEngineering #AIAssistedDevelopment


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
