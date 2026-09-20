# Technical Narrative — Secure Authentication API

Shared through-line for the Remotion presentation and the YouTube script. Every claim below
traces to real code, a real test run, or a real live-verification pass — see `docs/HLD.md`,
`docs/SECURITY.md`, `.claude/project/TASK_TRACKER.md` for the underlying evidence.

## The One-Sentence Pitch

A JWT authentication service that implements the parts most tutorials skip: refresh-token
rotation with reuse-detection, server-side-only RBAC, and a deliberately split token-transport
strategy — built with a full TDD discipline, 101 automated tests, and verified live against a
real Dockerized PostgreSQL stack.

## Why This Exists

Most "add JWT auth" tutorials stop at issuing a token. They don't answer: what happens when a
refresh token is stolen and replayed? Can a user self-assign the Admin role? Where does the
refresh token actually live in the browser, and why does that matter? This project answers all
three, explicitly, with a documented decision (`adr/0002-token-transport-and-refresh-rotation.md`)
rather than an unstated default.

## The Hard Decisions (in order of how much they shaped the system)

1. **Token transport split** (ADR-0002): access token in the JSON body (so Swagger/curl/Postman
   testing stays trivial), refresh token *only* as an `HttpOnly`/`Secure`/`SameSite=Strict`
   cookie (so it's never reachable by JS, eliminating its XSS exposure). Two different transport
   mechanisms for two tokens with two different risk profiles.
2. **Refresh rotation with reuse-rejection**: every refresh blacklists the token it consumed and
   issues a new one. A replayed (stolen, already-used) refresh token is rejected — verified with
   a test that rotates once, then replays the original and asserts 401.
3. **RBAC re-verified server-side, every request**: the JWT carries a role claim, but
   `get_current_user` re-fetches the live DB row on every protected request rather than trusting
   the claim — so a demoted or deactivated user's access changes without waiting for token
   expiry. Public registration has no `role` field at all — self-assigning Admin isn't a bug to
   patch, it's structurally impossible.
4. **Bcrypt via passlib, with a real compatibility bug found and fixed**: passlib 1.7.4
   (unmaintained since ~2020) breaks against bcrypt ≥4.1's stricter 72-byte enforcement. Pinned
   `bcrypt<4.1` rather than dropping the library `task.md` explicitly required.

## What "Tested" Actually Means Here

Not "I ran it once and it worked." Every piece of logic — password hashing, JWT claim
validation, refresh rotation, RBAC, logout — was built test-first: write a failing test, watch
it fail for the *right* reason (not a typo), write the minimal code to pass, watch it pass.
101 tests total (80 backend / 21 frontend), all currently green, plus a live 14-point
verification pass against a real Dockerized PostgreSQL stack — not the SQLite test double the
unit suite uses.

## What's Deliberately Not Done

Rate limiting, a scheduled job to prune the revocation table, `SECRET_KEY` rotation, and an
admin-provisioning endpoint are all explicitly absent — documented as known limitations in
`docs/SECURITY.md`, not hidden gaps discovered by a reviewer. The OAuth2 Resource Owner
Password Credentials flow itself is used because the assignment requires it, with the
production caveat (Authorization Code + PKCE is the modern recommendation) stated plainly
rather than silently endorsed.


---

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

Created and maintained by **Mahesh Kumar**, Founder & CEO of SaffronyxAI.in.

Third-party libraries, frameworks, assets, generated materials, client contributions, and
other external materials remain subject to their respective licenses and ownership terms.
