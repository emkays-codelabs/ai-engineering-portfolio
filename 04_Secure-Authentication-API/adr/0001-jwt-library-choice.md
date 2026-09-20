# ADR-0001: JWT library choice — PyJWT

**Status**: Accepted | **Date**: 2026-09-20 | **Author**: Mahesh Kumar

## Context

`task.md` requires JWT access tokens with expiry, issued via an OAuth2 Password Flow. Need a
library to encode/decode/verify JWTs from `core/security.py`, called by `token_service.py`.

## Decision Drivers

- Maintenance status (actively maintained, not deprecated).
- Minimal surface area — this project needs HS256 signing/verification and standard claim
  validation (`exp`, `sub`), not a full OAuth2/OIDC client/server framework.
- Compatibility with the confirmed stack (Python 3.12, FastAPI).

## Options Considered

| Option | Pros | Cons |
|---|---|---|
| PyJWT | Actively maintained, small/focused API, directly does encode/decode/verify with built-in `exp` checking, widely used with FastAPI | No built-in JWK/JWKS handling (not needed here — single symmetric secret) |
| python-jose | Historically the FastAPI-tutorial default, supports JWE/JWK | Maintenance has slowed significantly; broader feature set than this project needs |
| Authlib | Full OAuth2/OIDC provider+client framework | Substantial over-engineering for a single-service password-flow API — violates `rules/00-global-architect.md`'s "no premature abstraction" |

## Decision

Use **PyJWT** for all JWT encode/decode/verify operations in `core/security.py`.

## Rationale

This project needs exactly one thing from a JWT library: sign and verify HS256 tokens with
standard claim validation. PyJWT does that with the smallest, most actively maintained surface
area of the options considered — no unused OIDC/JWK machinery to reason about or keep patched.

## Consequences

- Signing is symmetric (`SECRET_KEY`, HS256) — the same secret is used to sign and verify, so
  it must never be exposed to the frontend or logged (`rules/05-security.md`).
- If a future requirement needs asymmetric signing (e.g. a separate token-issuing service),
  this decision would need revisiting — PyJWT supports RS256 too, so the library itself
  wouldn't need to change, only the key-management approach.

## Operational Cost

None beyond the dependency itself — no external service, no additional infrastructure.

## Revisit If

The project grows a second service that needs to verify tokens without sharing the symmetric
secret (would motivate switching to RS256 signing, still within PyJWT).

## Status

Accepted


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
