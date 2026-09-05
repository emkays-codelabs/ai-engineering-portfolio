# Engineering Rules

These files are the project's engineering rules, migrated from the former `.cursor/rules/*.mdc`
(Cursor-editor-specific format) into plain Markdown for Claude Code. `CLAUDE.md` at the repo root
remains the primary, authoritative project memory (tech stack, structure, conventions, status);
these files hold the more granular, topic-by-topic rules that supplement it.

| File | Covers |
|------|--------|
| [00-global-architect.md](00-global-architect.md) | Default architect-first operating mode for the whole repo |
| [05-prompt-persistence.md](05-prompt-persistence.md) | Prompt-history logging rule (also restated in `CLAUDE.md`) |
| [10-backend-fastapi.md](10-backend-fastapi.md) | FastAPI backend stack and layering rules |
| [12-interfaces-admin-user-mobile.md](12-interfaces-admin-user-mobile.md) | Admin / user-web / native-mobile interface split |
| [15-omni-channel.md](15-omni-channel.md) | Omni-channel messaging (Twilio, email, Slack/Teams) — post-MVP |
| [20-frontend-nextjs.md](20-frontend-nextjs.md) | Next.js frontend stack and layering rules |
| [25-voice-video.md](25-voice-video.md) | Voice/video AI support — post-MVP |
| [30-database-supabase.md](30-database-supabase.md) | Supabase/PostgreSQL persistence rules |
| [40-cache-redis.md](40-cache-redis.md) | Redis caching/queue rules |
| [45-observability.md](45-observability.md) | Logging, metrics, analytics rules |
| [50-rag-system.md](50-rag-system.md) | RAG/knowledge-base architecture rules |
| [55-ticketing-automation.md](55-ticketing-automation.md) | Smart ticketing and automation rules |
| [60-agents.md](60-agents.md) | AI agent / copilot / tool-use rules |
| [70-security.md](70-security.md) | Security, compliance, and PII rules |
| [80-testing-quality.md](80-testing-quality.md) | Testing philosophy and code quality rules |
| [90-devops-docker-aws.md](90-devops-docker-aws.md) | Docker, CI/CD, AWS deployment rules |
| [95-integrations.md](95-integrations.md) | External integrations (CRM, Zendesk, Jira, Slack) — post-MVP |
| [99-response-style.md](99-response-style.md) | How to respond when implementing/planning |

Note: several files (omni-channel, voice/video, native mobile, external integrations) describe the
full long-term product vision from the PRD, not the current MVP. Cross-check against CLAUDE.md's
"Not Yet Implemented (Post-MVP)" list before treating those rules as describing what already exists.
