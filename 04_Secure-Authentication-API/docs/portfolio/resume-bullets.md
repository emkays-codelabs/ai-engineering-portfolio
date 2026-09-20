# Resume Bullets — Secure Authentication API

Every bullet below traces to a real, verified artifact — see the "Evidence" column. Framed as
directed/reviewed AI-paired development, per `rules/10-portfolio-resume.md`'s AI-assisted-work
disclosure requirement — none of these imply solo hand-written implementation.

| Bullet | Evidence |
|---|---|
| Directed the design and AI-paired implementation of a JWT authentication service (FastAPI/PostgreSQL) with refresh-token rotation and reuse-detection, verified via 101 automated tests (80 backend, 21 frontend) | `TASK_TRACKER.md` C1–C11, D1–D2 |
| Documented and enforced a deliberate token-transport security decision (access token in response body, refresh token in an HttpOnly/SameSite=Strict cookie) via a formal ADR, rather than defaulting to a common but less secure pattern | `adr/0002-token-transport-and-refresh-rotation.md` |
| Caught and corrected a real third-party dependency incompatibility (passlib vs. bcrypt 4.1+) during test-first development, resolved via a documented, scoped version pin | `TASK_TRACKER.md` C2 |
| Enforced server-side-only role-based access control, verified via automated tests that a client cannot self-assign the Admin role and that a regular user is rejected (403) from an admin-only route | `tests/integration/test_admin_routes.py` |
| Deployed and live-verified a Dockerized full-stack application (FastAPI + PostgreSQL) with automatic database migrations, confirmed via a scripted 14-point end-to-end check against the running containers | `TASK_TRACKER.md` F1, H1 |
| Directed a corrective process when architecture and requirements documentation (HLD, ADRs, PRD, LLD) were initially skipped mid-project — required and verified their backfill before continuing, rather than letting the gap stand | `TASK_TRACKER.md` B1–B3 |
| Produced a full documentation and audit trail (PRD, HLD, LLD, API spec, security review, final project audit) with every claim traced to a specific test run or code reference, and every known limitation explicitly disclosed | `docs/FINAL_PROJECT_AUDIT.md` |


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
