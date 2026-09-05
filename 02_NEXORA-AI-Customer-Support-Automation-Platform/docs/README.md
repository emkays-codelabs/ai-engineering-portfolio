# Documentation Index

These docs were written early, describing the full long-term product vision from the PRD —
omni-channel messaging, voice/video, a native mobile app, CRM integrations. The table below
marks what's actually built in this MVP vs. what's still roadmap, so you don't mistake one
for the other. For what's genuinely implemented today, **CLAUDE.md at the repo root is the
source of truth** — these docs supplement it with deeper detail on the topics they cover.

| Doc | Covers | Status |
|-----|--------|--------|
| [PRD.md](PRD.md) | Product vision, full feature list, tech stack rationale | 🔭 Vision — describes the target product, not the current build |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Component layering, request flow, layer responsibilities | ✅ Matches current code for what's built; some referenced components (voice, channels) are not yet implemented |
| [API_SPEC.md](API_SPEC.md) | Full API surface across web, mobile, integrations, webhooks | ⚠️ Partial — documents endpoints beyond what exists today (e.g. Voice API, `/customers/*`, `/admin/api-keys`); cross-check against `backend/app/routes/` for what's actually live |
| [DB_SCHEMA.md](DB_SCHEMA.md) | Logical database schema, table purposes and relationships | ⚠️ Partial — some tables described here (`voice_calls`, `integrations_config`, `slas`) aren't in the migrations yet; see `backend/supabase/migrations/` for what's actually created |
| [DEPLOYMENT.md](DEPLOYMENT.md) | AWS deployment architecture, CI/CD, observability targets | 🔭 Vision — describes the target production setup; the MVP currently runs via `docker-compose` locally |

## What's actually implemented (MVP)

For the accurate, current-state picture — the 9 backend route modules that exist, the 16
frontend routes, the 58 passing tests, the exact env vars read by the app — see:

- [CLAUDE.md](../CLAUDE.md) — "Implementation Status" and "API Endpoints" sections
- [../README.md](../README.md) — quickstart and feature summary
- `.claude/rules/*.md` — engineering rules, with the same vision-vs-MVP caveat noted in
  [.claude/rules/README.md](../.claude/rules/README.md)

## Reading order

If you're new to this project, read in this order: `../README.md` → `CLAUDE.md` → `ARCHITECTURE.md`
→ `DB_SCHEMA.md` → `API_SPEC.md`. Read `PRD.md` and `DEPLOYMENT.md` last, and only if you want
the long-term vision beyond the current MVP.
