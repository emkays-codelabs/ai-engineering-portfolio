# API Specification — Secure Authentication API

**Version**: 1.0 | **Date**: 2026-09-20 | **Author**: Mahesh Kumar

Base URL: `http://localhost:8000` (local/Docker). Interactive docs (Swagger UI) are auto-generated
by FastAPI at `/docs` whenever the API is running.

All request/response bodies below reflect the actual Pydantic schemas in `backend/app/schemas/`
— not aspirational. Error responses always use this envelope
(`backend/app/middleware/exception_handlers.py`):

```json
{ "error": true, "code": "SOME_CODE", "message": "Human-readable message", "details": {} }
```

## Authentication (`/api/v1/auth`)

### `POST /api/v1/auth/register`

Request (JSON):
```json
{ "email": "alice@example.com", "password": "a-valid-password" }
```
- `password`: 8–72 characters (72 is bcrypt's hard limit, enforced here as a 422 rather than a 500).

Response `201`:
```json
{
  "id": "01a0bb4a-726e-7869-ba98-63a862e55b62",
  "email": "alice@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2026-09-20T00:10:13.243839Z"
}
```
Errors: `409 EMAIL_ALREADY_REGISTERED`, `422` (validation).

### `POST /api/v1/auth/login`

OAuth2 Password Flow — request body is **form-encoded**, not JSON (`username` = email):
```
username=alice%40example.com&password=a-valid-password
```

Response `200`:
```json
{ "access_token": "eyJhbGc...", "token_type": "bearer" }
```
Also sets a `refresh_token` cookie (`HttpOnly`, `Secure` outside local dev, `SameSite=Strict`,
scoped to `/api/v1/auth`) — the refresh token is **never** present in the JSON body.

Errors: `401 INVALID_CREDENTIALS` (wrong password, unknown email, or inactive user — deliberately
indistinguishable, see `docs/SECURITY.md` Section 9).

### `POST /api/v1/auth/refresh`

No request body — reads the `refresh_token` cookie. Rotates it: the presented token is
blacklisted and a new access/refresh pair is issued.

Response `200`: same shape as login. Sets a new `refresh_token` cookie.

Errors: `401 INVALID_REFRESH_TOKEN` — missing cookie, malformed/expired token, wrong token
`type`, or replay of an already-rotated/revoked token.

### `POST /api/v1/auth/logout`

No request body — reads the `refresh_token` cookie. Deliberately lenient: **always** succeeds,
even with a missing, malformed, or already-revoked token (see `docs/SECURITY.md` Section 4).

Response `204` (no body). Clears the `refresh_token` cookie.

## Users (`/api/v1/users`)

### `GET /api/v1/users/me`

Protected — `Authorization: Bearer <access_token>`.

Response `200`:
```json
{
  "id": "01a0bb4a-726e-7869-ba98-63a862e55b62",
  "email": "alice@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2026-09-20T00:10:13.243839Z"
}
```

Errors: `401 INVALID_ACCESS_TOKEN` (missing/malformed/expired/wrong-type token, or the user is
no longer active).

## Admin (`/api/v1/admin`)

### `GET /api/v1/admin/users`

Protected + admin-only — `Authorization: Bearer <access_token>` for a user with `role: "admin"`.

Response `200`: array of the same user shape as `GET /users/me`, one entry per registered user.

Errors: `401 INVALID_ACCESS_TOKEN` (unauthenticated), `403 INSUFFICIENT_ROLE` (authenticated but
not an admin).

**Note**: there is no endpoint to promote a user to `admin` — this requires direct DB access.
Documented as a known limitation in `docs/SECURITY.md` Section 5, not an oversight.

## Health

### `GET /health`

Unversioned, unauthenticated. Readiness check — verifies the real DB dependency
(`SELECT 1`), not just process liveness (`rules/02-architecture.md` Rule 9).

Response `200`: `{ "status": "ok" }`
Response `503`: `{ "status": "unavailable" }` (DB unreachable)


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
