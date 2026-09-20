# Demo Flow — Secure Authentication API

Verified live on 2026-09-20 against `docker compose up --build` (real PostgreSQL) + the actual
React dev server, per `checklists/demo.md` and `rules/07-demo-standards.md`. Every response
shown below is real output captured during that run — see `.claude/project/TASK_TRACKER.md`
task `H1` for the full 14-point verification log this flow is drawn from.

## 1. Environment Startup

```
$ docker compose up --build
...
Container 01_secure-authentication-api-db-1   Healthy
Container 01_secure-authentication-api-api-1  Started
```

## 2. Health Check

`GET /health` → `200 {"status": "ok"}` — readiness check verifies a real DB query, not just
process liveness.

## 3. Registration

`POST /api/v1/auth/register` with `{"email": "demo-user@example.com", "password": "a-valid-password"}`

```json
201 {
  "id": "01a0bb5e-25af-7524-89dd-d0ac50628dc6",
  "email": "demo-user@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2026-09-19T20:31:44.278040Z"
}
```

Note the `id` — a genuine UUIDv7 (time-sortable prefix), not a sequential integer.

## 4. Valid Login

`POST /api/v1/auth/login` (form-encoded, OAuth2 Password Flow) → `200`, body contains
`access_token` only. `Set-Cookie: refresh_token=...; HttpOnly; SameSite=Strict` — the refresh
token never appears in the JSON response.

## 5. Invalid Login

Same endpoint, wrong password → `401 {"code": "INVALID_CREDENTIALS", ...}`.

## 6. Protected API

`GET /api/v1/users/me` with `Authorization: Bearer <access_token>` → `200`, returns the current
user. Without the header → `401`.

## 7. JWT Working

Decoded access token payload (signature verified server-side, shown here for the walkthrough):
```json
{"sub": "01a0bb5e-...", "type": "access", "jti": "476ae9f6-...", "iat": 1789849904, "exp": 1789850804, "role": "user"}
```

## 8. Refresh

`POST /api/v1/auth/refresh` (cookie only, no body) → `200`, new `access_token` (different from
the original), new rotated cookie.

## 9. Authorization Flow (RBAC)

`GET /api/v1/admin/users` as a regular user → `403 {"code": "INSUFFICIENT_ROLE", ...}`.

## 10. Logout

`POST /api/v1/auth/logout` → `204`, cookie cleared.

## 11. Revocation Takes Effect

Attempting `POST /api/v1/auth/refresh` again with the now-logged-out cookie → `401
{"code": "INVALID_REFRESH_TOKEN", ...}` — proves logout actually revoked the token, not just
cleared the client-side cookie.

## Known Limitations Disclosed During Demo

No rate limiting on auth endpoints; no automatic cleanup of the revocation table; no
admin-provisioning UI (promoting to Admin requires direct DB access). Full list:
`docs/SECURITY.md` Section 10.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
