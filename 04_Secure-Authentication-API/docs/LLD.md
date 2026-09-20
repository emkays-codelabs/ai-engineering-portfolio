# Low-Level Design — Secure Authentication API

**Project**: Secure Authentication API | **Version**: 1.0 | **Date**: 2026-09-20 |
**Author**: Mahesh Kumar

Covers the two components with genuine internal design worth documenting at this depth —
`TokenService` (the refresh-rotation state machine) and the RBAC dependency chain. The
remaining components (`UserRepository`, `TokenRepository`, Pydantic schemas) are simple,
fully specified by their code and by `docs/API_SPEC.md`; a separate LLD for each would restate
the code rather than add information.

---

## Component: `TokenService` (`backend/app/services/token_service.py`)

### 1. Purpose

Issues, rotates, and revokes JWT access/refresh token pairs — the only component that touches
`TokenRepository` (the `token_blacklist` table).

### 2. Interface

| Method | Input | Output | Errors |
|---|---|---|---|
| `issue_tokens(user: User)` | A `User` ORM instance | `(access_token: str, refresh_token: str, refresh_jti: str)` | None — pure token construction |
| `refresh(refresh_token: str)` | A refresh JWT string | New `(access_token, refresh_token, refresh_jti)` triple | `InvalidRefreshTokenError` |
| `logout(refresh_token: str \| None)` | A refresh JWT string, or `None` | `None` | Never raises (see Section 6) |

### 3. Internal Design

Constructed with `(user_repo: UserRepository, token_repo: TokenRepository)` — both injected, no
global state. `issue_tokens` is a pure function of its `User` argument (calls
`core.security.create_access_token`/`create_refresh_token`, no DB access). `refresh` and
`logout` are the only methods that touch the database, and only through the two injected
repositories — never raw SQLAlchemy calls in this file.

### 4. Data Model

Owns no table directly. Reads/writes `token_blacklist` exclusively through `TokenRepository`:

| Column | Type | Written by |
|---|---|---|
| `jti` | `str`, unique | `refresh()`, `logout()` — the token being revoked |
| `user_id` | UUID, FK → `users.id` | Same |
| `token_type` | `str` (`"refresh"`) | Same — access tokens are never individually blacklisted |
| `expires_at` | `datetime` | Copied from the revoked token's own `exp` claim |
| `blacklisted_at` | `datetime` | `server_default=func.now()` |

### 5. Sequence — `refresh()`

```
1. decode_token(refresh_token)          → raises InvalidRefreshTokenError on any jwt.PyJWTError
2. check payload["type"] == "refresh"   → else InvalidRefreshTokenError (wrong token type)
3. check token_repo.is_blacklisted(jti) → if True, InvalidRefreshTokenError (reuse/replay)
4. user_repo.get_by_id(payload["sub"])  → None or inactive → InvalidRefreshTokenError
5. token_repo.blacklist(jti, ...)       → revoke the presented token (rotation)
6. return issue_tokens(user)            → brand-new pair
```

Step 5 happens unconditionally before step 6 — this is what makes rotation atomic-in-effect:
once a refresh token has been presented once (successfully or not, past step 3), it can never
be redeemed again, whether or not step 6 itself succeeds.

### 6. Error Handling

- `refresh()`: every failure mode collapses to the single `InvalidRefreshTokenError` — the
  caller (the API layer) doesn't distinguish "expired" from "reused" from "wrong type" in the
  HTTP response, deliberately (no information that would help an attacker distinguish attack
  vectors).
- `logout()`: the mirror-image policy — every failure mode is silently absorbed (`return` with
  no exception). A missing, malformed, expired, wrong-typed, or already-revoked token is a
  successful no-op. This asymmetry (`refresh` strict, `logout` lenient) is deliberate: a failed
  refresh should force re-login; a "failed" logout of an already-invalid token isn't a failure
  from the client's perspective at all.

### 7. Invariants & Contracts

- **A given refresh `jti` can be redeemed at most once.** Enforced by the blacklist-before-issue
  ordering in Section 5 — violating this ordering (e.g. issuing new tokens before blacklisting
  the old one) would reopen the replay window this component exists to close.
- **`issue_tokens` never reads from the database.** Any future change that makes it do so would
  break the "pure function of `User`" property that `logout`'s test suite and `login`'s endpoint
  both depend on implicitly.

### 8. Dependencies

Depends on: `UserRepository`, `TokenRepository`, `core.security` (JWT encode/decode).
Depended on by: `api/v1/endpoints/auth.py` (login/refresh/logout routes), via
`core/dependencies.py::get_token_service`.

---

## Component: RBAC Dependency Chain (`backend/app/core/dependencies.py` + `authorization_service.py`)

### 1. Purpose

Resolves the authenticated `User` from a bearer token on every protected request, and enforces
role requirements for admin-only routes — the single place authorization decisions are made.

### 2. Interface

| Function | Input | Output | Errors |
|---|---|---|---|
| `get_current_user(token, auth_service)` | Bearer token string (via FastAPI `Depends`) | `User` | `InvalidAccessTokenError` |
| `get_current_admin_user(user)` | `User` (via `Depends(get_current_user)`) | `User` | `InsufficientRoleError` |
| `require_role(user, *allowed_roles)` | `User`, one or more `Role` values | `None` | `InsufficientRoleError` |

### 3. Internal Design

`get_current_user` delegates the actual token-decode-and-lookup logic to
`AuthService.get_current_user` (testable without FastAPI's DI machinery — see
`tests/unit/test_auth_service.py`). `get_current_admin_user` composes on top of
`get_current_user` via FastAPI's own dependency chaining (`Depends(get_current_user)`) rather
than duplicating the token-resolution logic. `require_role` is a plain function with no
framework dependency at all, callable directly from a unit test.

### 4. Data Model

Reads `users.role` (a `Role` enum column, `USER`/`ADMIN`) fresh on every call — never cached,
never trusted from the JWT claim alone for the authorization decision itself (the claim is
still carried for observability/debugging, just not trusted).

### 5. Sequence — Admin-Route Request

```
1. FastAPI extracts the bearer token from the Authorization header (OAuth2PasswordBearer)
2. get_current_user → AuthService.get_current_user(token)
     a. decode_token(token)              → InvalidAccessTokenError on any jwt error
     b. check payload["type"] == "access" → else InvalidAccessTokenError
     c. user_repo.get_by_id(payload["sub"]) → None/inactive → InvalidAccessTokenError
3. get_current_admin_user → require_role(user, Role.ADMIN)
     → user.role != ADMIN → InsufficientRoleError (403)
4. Route handler runs with a verified, live, admin User
```

### 6. Error Handling

`InvalidAccessTokenError` → 401 with `WWW-Authenticate: Bearer` (the request itself isn't
trusted). `InsufficientRoleError` → 403 (the request is authenticated, just not permitted) —
these are deliberately different HTTP status codes so a client/log can distinguish "you're not
logged in" from "you're logged in but not allowed here."

### 7. Invariants & Contracts

- **Every protected route resolves the user from the live DB row, never from the JWT claim
  alone.** This is what makes role changes and deactivation take effect immediately rather than
  waiting for token expiry (`docs/HLD.md` Section 7) — a change to this behavior would need an
  explicit ADR, since it trades a real security property for a small latency win.
- **No route implements its own ad hoc auth check.** Every protected route's signature includes
  `Depends(get_current_user)` or `Depends(get_current_admin_user)` — a route that checked
  authorization inline would bypass this component entirely and is treated as a defect.

### 8. Dependencies

Depends on: `AuthService`, `Role` (from `models.user`). Depended on by: every protected route
(`users.py`, `admin.py`) and, transitively, the frontend's expectation of consistent 401/403
semantics across all protected endpoints.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
