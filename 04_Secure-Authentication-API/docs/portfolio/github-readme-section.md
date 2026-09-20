# GitHub README Section — Drop-In

Paste this into a portfolio README's "Projects" section.

---

### [Secure Authentication API](https://github.com/<org>/<repo>)

A JWT authentication service (FastAPI + PostgreSQL + React) implementing what most auth
tutorials skip: refresh-token rotation with reuse-rejection, server-side-only RBAC, and a
documented token-transport decision (access token in the response body, refresh token in an
HttpOnly cookie). Built test-first — 101/101 automated tests passing — and verified live
against a real Dockerized PostgreSQL stack.

**Stack**: FastAPI · SQLAlchemy · PostgreSQL · PyJWT · bcrypt · React · TypeScript · Docker

**Highlights**:
- Refresh tokens rotate on use and reject replay of an already-consumed token
- Public registration cannot self-assign the Admin role — structurally, not by convention
- Every architectural decision documented as an ADR before implementation, not after
- Full doc trail: PRD → HLD/LLD → ADRs → API spec → security review → final audit, every claim
  traced to a real test or a real code reference

[README](README.md) · [Architecture](docs/HLD.md) · [API Spec](docs/API_SPEC.md) ·
[Security](docs/SECURITY.md)


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
