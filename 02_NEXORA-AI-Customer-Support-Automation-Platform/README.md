# NEXORA AI Support Copilot

AI-powered customer support platform — a RAG-based chatbot, agent copilot, smart ticketing,
and admin console served from one FastAPI backend and one Next.js frontend, across three
role-based interfaces (admin, agent, customer).

**Status:** MVP — all core features implemented and tested (58 backend tests, 16 frontend routes).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript (strict), Tailwind CSS 4 |
| Backend | Python 3.11+, FastAPI, Pydantic v2 |
| Database | Supabase (PostgreSQL + pgvector) |
| Cache | Redis (optional — app degrades gracefully without it) |
| AI | Euron EURI API (OpenAI-compatible) |
| Auth | JWT + bcrypt, RBAC (admin / agent / customer) |

## Features

- **AI chatbot (RAG)** — REST + WebSocket chat grounded in your knowledge base, with citations and agent escalation
- **Knowledge base** — document upload, URL ingestion, chunking + embeddings, collections
- **Smart ticketing** — auto-assignment to the least-loaded available agent
- **Agent copilot** — AI-suggested replies, conversation summaries, KB retrieval
- **Admin panel** — agent management, AI config, analytics dashboard

## Quickstart

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in Supabase / EURI credentials
uvicorn app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev

# Redis (optional)
docker run -p 6379:6379 redis:alpine
```

Or via Docker Compose: `docker compose up --build`.

Run backend tests: `cd backend && python -m pytest app/tests/ -v`

## Project Structure

```
backend/    FastAPI app — routes -> services -> repositories, Supabase + Redis + EURI integrations
frontend/   Next.js app — admin/*, agent/*, and customer-facing routes
docs/       PRD, architecture, API spec, DB schema, deployment docs
.claude/    Engineering rules and project instructions for Claude Code
prompts/    Append-only log of every prompt used to build this project
```

See [CLAUDE.md](CLAUDE.md) for the full architecture, API reference, coding conventions, and
implementation status (including what's intentionally not yet built).

## License

Portfolio project — not licensed for reuse without permission.
