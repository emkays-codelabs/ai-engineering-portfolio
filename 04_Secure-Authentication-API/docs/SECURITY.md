# Security Review — Secure Authentication API

**Version**: 1.0 | **Date**: 2026-09-20 | **Author**: Mahesh Kumar

Every control below is IMPLEMENTED and traceable to real code (file references given) — this
is not an aspirational checklist. Known limitations are disclosed explicitly, not hidden.

## 1. Password Storage

- **IMPLEMENTED**: bcrypt via passlib (`backend/app/core/security.py`, `hash_password`/
  `verify_password`). Salted automatically per-hash by bcrypt (verified in
  `tests/unit/test_security.py::test_hash_password_salts_so_identical_passwords_hash_differently`).
- **IMPLEMENTED**: input length capped at 72 bytes at the schema layer
  (`backend/app/schemas/user.py`, `UserCreate.password`) to preempt bcrypt's hard 72-byte limit
  with a clear 422 instead of a 500.
- Plaintext passwords are never logged or persisted — only `hashed_password` is stored on
  `User` (`backend/app/models/user.py`).

## 2. JWT Signing and Validation

- **Library**: PyJWT, HS256 — see `adr/0001-jwt-library-choice.md` for the rationale.
- **IMPLEMENTED validation rules** (`backend/app/core/security.py::decode_token`, exercised via
  `AuthService.get_current_user` and `TokenService.refresh`): signature verified against
  `SECRET_KEY`; algorithm pinned to `HS256` (no algorithm-confusion attack surface — `jwt.decode`
  is called with an explicit `algorithms=[...]` allowlist, never trusting the token's own `alg`
  header); expiry (`exp`) enforced by PyJWT; token `type` claim checked explicitly so a refresh
  token can never be accepted where an access token is expected, and vice versa
  (`tests/unit/test_auth_service.py::test_get_current_user_rejects_a_refresh_token_presented_as_access`,
  `tests/unit/test_token_service.py::test_refresh_rejects_an_access_token_presented_as_refresh`).
- **IMPLEMENTED**: `SECRET_KEY` is required config with no default (`core/config.py`) — the
  application fails to start rather than run with a missing/weak key.
- **Key rotation**: **NOT IMPLEMENTED**. A single static `SECRET_KEY` is used for the life of the
  deployment. Known limitation — a production system would need a key-rotation strategy (e.g.
  a `kid` header and a small keyset) to revoke a compromised key without invalidating every
  outstanding session.

## 3. Access & Refresh Tokens

- Access token: 15 minutes default (`ACCESS_TOKEN_EXPIRE_MINUTES`), returned in the JSON
  response body, sent as an `Authorization: Bearer` header.
- Refresh token: 7 days default (`REFRESH_TOKEN_EXPIRE_DAYS`), **never** returned in a JSON body
  — set only via an `HttpOnly`, `Secure` (outside local dev), `SameSite=Strict` cookie scoped to
  `/api/v1/auth` (`backend/app/api/v1/endpoints/auth.py`). Full rationale:
  `adr/0002-token-transport-and-refresh-rotation.md`.
- **IMPLEMENTED — rotation + reuse rejection**: every successful `/auth/refresh` call blacklists
  the presented token's `jti` and issues a new pair. Replaying an already-rotated (or otherwise
  blacklisted) refresh token is rejected with 401 `INVALID_REFRESH_TOKEN`
  (`tests/integration/test_refresh.py::test_refresh_rejects_replay_of_an_already_rotated_cookie`).

## 4. Revocation (Logout)

- **IMPLEMENTED**: `POST /auth/logout` inserts the presented refresh token's `jti` into the
  `token_blacklist` table (insert-only — no `UPDATE`/`DELETE`, per `rules/02-architecture.md`
  Rule 4) and clears the cookie. Logout is deliberately lenient/idempotent — a missing,
  malformed, or already-revoked token never errors (`backend/app/services/token_service.py::logout`).
- Access tokens are **not** individually revocable — they rely on their short (15 min) expiry.
  A logged-out user's still-live access token remains valid until it naturally expires. Known
  limitation, accepted trade-off for keeping access-token validation stateless (no DB hit per
  request) — see `docs/HLD.md` Section 8.
- **Blacklist cleanup**: **NOT IMPLEMENTED**. `token_blacklist` grows without bound; no
  scheduled job prunes rows past their `expires_at`. Acceptable for this project's scope
  (submission-sized, not a long-running production deployment) but flagged as a real gap for
  any actual production use.

## 5. Role-Based Access Control (RBAC)

- **IMPLEMENTED — server-side only**: every protected route re-derives the current user's role
  from the live DB row via `get_current_user` → `AuthService.get_current_user`
  (`backend/app/core/dependencies.py`), never trusting the JWT's `role` claim alone for
  authorization decisions on admin routes — `authorization_service.require_role` is the single
  place role checks happen (`backend/app/services/authorization_service.py`).
- **IMPLEMENTED — public registration cannot self-assign a role**: `UserCreate`
  (`backend/app/schemas/user.py`) has no `role` field; `AuthService.register` never accepts one.
  Every self-registered account is hardcoded to `Role.USER` at the ORM level
  (`backend/app/models/user.py`).
- Promoting a user to `Role.ADMIN` currently has **no dedicated endpoint** — it requires direct
  DB access. This is intentional for this project's scope (no admin-provisioning flow was
  requested), not an oversight, but is worth stating explicitly as a **KNOWN LIMITATION**.

## 6. Transport & Session Handling

- CORS: configured with an explicit allowed origin (never a wildcard combined with
  `allow_credentials=True`, which browsers reject anyway) — see `backend/app/main.py`. Required
  because the refresh cookie needs `credentials: "include"` from the frontend.
- CSRF: `SameSite=Strict` on the refresh cookie is the primary mitigation for this project's
  scope (single frontend origin, no cross-site form posts to the refresh/logout endpoints).
  **KNOWN LIMITATION**, disclosed in `adr/0002-token-transport-and-refresh-rotation.md`: a
  production system serving multiple origins would need an explicit CSRF token in addition.

## 7. Rate Limiting

**NOT IMPLEMENTED.** `rules/05-security.md` calls for rate-limiting sensitive endpoints
(login, registration, refresh). This project does not implement it — disclosed as a known gap
rather than silently omitted. A production deployment should add rate limiting at either the
application layer (e.g. `slowapi`) or the reverse-proxy/gateway layer in front of the API,
particularly on `/auth/login` (brute-force credential guessing) and `/auth/refresh`.

## 8. OAuth2 Password Flow — Protocol Caveat

This project implements OAuth2's Resource Owner Password Credentials (ROPC) grant, as
explicitly required by `task.md`. **This is documented here as a deliberate scope decision, not
a recommendation**: RFC 6749's ROPC flow is not considered appropriate for new production OAuth
deployments (the client handles the user's raw password directly). A real production identity
platform should use a modern flow such as Authorization Code with PKCE, or delegate identity to
an established provider. ROPC was implemented here specifically because `task.md` requires it
and because it is directly testable via Swagger UI / curl / Postman for the required demo.

## 9. Input Validation

- **IMPLEMENTED**: every request body is a typed Pydantic schema (`backend/app/schemas/`) —
  never a raw dict. Invalid email format, short/long passwords, and malformed JSON all return
  422 before any business logic runs.
- **IMPLEMENTED**: `InvalidCredentialsError` is deliberately a single exception covering "wrong
  password," "unknown email," and "inactive user" — a distinguishable error per case would let
  an attacker enumerate which emails have registered accounts
  (`backend/app/services/auth_service.py`).

## 10. Summary of Known Limitations (Not Hidden)

| Limitation | Why it's out of scope here |
|---|---|
| No key rotation for `SECRET_KEY` | Single-deployment demo scope |
| No scheduled cleanup of expired `token_blacklist` rows | Submission-sized project, not a long-running deployment |
| No admin-provisioning endpoint (DB access required to promote a user) | Not requested by `task.md` |
| No rate limiting on auth endpoints | Not implemented — real gap, documented per Section 7 |
| No explicit CSRF token (relies on `SameSite=Strict`) | Single-origin frontend; documented trade-off in ADR-0002 |
| ROPC (OAuth2 Password Flow) instead of Authorization Code + PKCE | Required explicitly by `task.md`; documented caveat in Section 8 |
| Access tokens not individually revocable | Stateless-by-design trade-off; short (15 min) expiry bounds the exposure |


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
