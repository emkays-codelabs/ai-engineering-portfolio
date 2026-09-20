# ADR-0002: Token transport strategy and refresh-token rotation

**Status**: Accepted | **Date**: 2026-09-20 | **Author**: Mahesh Kumar

## Context

The external architecture review of this project's folder structure flagged (as P0/P1 items):
undefined refresh-token rotation/revocation semantics, and undefined frontend credential
storage (`rules/05-security.md`: never trust the client; avoid long-lived tokens in
`localStorage`). Both need a decision before `C4`–`C6` (login, JWT issuance, refresh endpoint)
are implemented, since the decision shapes the endpoint contracts themselves.

## Decision Drivers

- `task.md` requires an OAuth2 Password Flow demoable via Swagger UI/curl/Postman for the
  YouTube submission — the access token must be easy to obtain and use in those tools.
- The refresh token is the higher-value, longer-lived credential — its exposure surface matters
  more than the access token's.
- `rules/05-security.md`: never trust client-side enforcement; secure defaults.

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| Both tokens in JSON body, frontend stores both (e.g. `localStorage`) | Simplest to implement; matches raw OAuth2 spec token response shape | Refresh token readable by any injected/XSS'd JS — exactly what the external review flagged |
| Both tokens as HttpOnly cookies | Neither token readable by JS — strongest XSS protection | Breaks Swagger UI/curl testing of protected routes without extra cookie-jar setup; complicates the demo required by `task.md` |
| Access token in JSON body; refresh token as HttpOnly, Secure, SameSite=Strict cookie | Access token stays trivially testable via Swagger/curl/Postman (satisfies demo requirement); refresh token never touches JS, eliminating its XSS exposure | Two different transport mechanisms to implement and document (accepted complexity) |

## Decision

**Split transport**: `POST /auth/login` and `POST /auth/refresh` return the access token in the
JSON response body (`{"access_token": ..., "token_type": "bearer"}`); the refresh token is set
only via `Set-Cookie` (`HttpOnly`, `Secure`, `SameSite=Strict`), never included in any JSON
response body.

**Refresh rotation**: each successful `POST /auth/refresh` call invalidates the presented
refresh token (its `jti` is inserted into `token_blacklist`) and issues a brand-new refresh
token (new `jti`, new cookie). A refresh token whose `jti` is already in `token_blacklist` is
rejected — this is reuse detection: if a stolen refresh token gets replayed after the legitimate
client already rotated past it, the replay is rejected rather than silently honored.

**Logout**: inserts the current refresh token's `jti` into `token_blacklist` and clears the
cookie. Access tokens are not individually blacklisted — they are short-lived by design
(`ACCESS_TOKEN_EXPIRE_MINUTES`, default 15) and expire naturally.

## Rationale

The split satisfies both drivers at once: the access token (short-lived, lower blast radius)
stays fully compatible with the OAuth2 Password Flow tooling `task.md`'s demo requires, while
the refresh token (long-lived, high blast radius if stolen) gets cookie-based XSS protection
that neither the "both in body" nor a purely token-based frontend design would provide.

## Consequences

- The frontend (`frontend/src/services/api-client.ts`) must send requests with
  `credentials: "include"` for the cookie to be sent, and the backend must set matching CORS
  configuration (explicit allowed origin, `allow_credentials=True` — never a wildcard origin
  combined with credentials).
- `token_repository.py` needs a lookup-by-`jti` method for both the rejection check and the
  insert-on-rotation/logout path; this repository method is the only place that touches
  `token_blacklist`, per `rules/15-backend-structure.md`.
- CSRF: `SameSite=Strict` on the refresh cookie is the primary mitigation for this project's
  scope (single frontend origin, no cross-site form posts to the refresh endpoint). Documented
  as a **KNOWN LIMITATION**: a production system serving multiple origins would need an
  additional explicit CSRF token, which is out of scope here per `CLAUDE.md`'s non-goals.

## Operational Cost

None beyond the `token_blacklist` table already in `C1`'s migration — no new infrastructure.

## Revisit If

The frontend ever needs to be served from a different origin than the API (would need CORS +
CSRF strategy revisited), or if access-token blast radius needs reducing further (would motivate
shortening `ACCESS_TOKEN_EXPIRE_MINUTES` rather than changing this transport decision).

## Status

Accepted


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
