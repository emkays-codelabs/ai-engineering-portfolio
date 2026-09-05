# NEXORA AI Support Copilot

![Status](https://img.shields.io/badge/status-MVP-blue)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2016-black)
![Tests](https://img.shields.io/badge/tests-58%20passing-brightgreen)

An AI-powered customer support platform: a retrieval-augmented (RAG) chatbot, an AI copilot
for support agents, smart ticketing with auto-assignment, and an admin console — all served
from one FastAPI backend and one Next.js frontend, across three role-based interfaces
(admin, agent, customer).

**Status:** MVP — all core features implemented and tested (58 backend tests, 16 frontend routes,
verified passing). See [docs/README.md](docs/README.md) for which parts of the docs describe this
MVP vs. the longer-term product vision.

---

## What is this, in plain terms?

Picture a support widget on a company's website. A customer types a question; instead of
waiting for a human, an AI reads the company's own help docs (that's the "RAG" / knowledge
base part) and answers immediately, with citations. If the AI can't help after a few tries,
the conversation escalates to a human agent — who gets their own dashboard with an AI
"copilot" that drafts suggested replies and conversation summaries for them. Behind the
scenes, support tickets are automatically created and assigned to whichever agent has the
lightest workload. An admin console lets a manager configure the AI, manage the knowledge
base, and see analytics (ticket volume, resolution time, etc.).

That's the whole product: one Next.js web app with three different views (admin / agent /
customer) depending on who's logged in, talking to one FastAPI backend.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Three Interfaces, One App](#three-interfaces-one-app)
- [Prerequisites](#prerequisites)
- [Quickstart](#quickstart)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Testing](#testing)
- [Documentation](#documentation)
- [License](#license)

---

## Features

| Feature | What it does |
|---------|---------------|
| **AI Chatbot (RAG)** | REST + WebSocket chat grounded in your knowledge base; answers cite sources and escalate to a human agent after repeated low-confidence replies |
| **Knowledge Base** | Upload documents or ingest from a URL; automatic chunking + embedding; organize into named collections |
| **Smart Ticketing** | Tickets auto-assign to the least-loaded available agent; status/priority tracking with SLA fields |
| **Agent Copilot** | AI-suggested replies, conversation summaries, and knowledge-base retrieval to speed up human agents |
| **Admin Panel** | Agent management, AI configuration, and an analytics dashboard (ticket volume, resolution time, CSAT) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript (strict), Tailwind CSS 4, Lucide icons |
| Backend | Python 3.11+, FastAPI, Pydantic v2 |
| Database | Supabase (PostgreSQL + pgvector for vector search) |
| Cache | Redis (optional — the app degrades gracefully without it) |
| AI | Euron EURI API (OpenAI-compatible: chat completions + embeddings) |
| Auth | JWT (access + refresh), bcrypt password hashing, RBAC (admin / agent / customer) |
| Deployment | Docker (standalone Next.js build), AWS-ready (ECS Fargate, ALB, S3) |

## Architecture

```
Clients: Admin (web) + Agent (web) + Customer (web)
              |
         ALB / API Gateway
              |
    +---------+---------+
    |                   |
Next.js App        FastAPI Backend
(16 routes)        (REST + WebSocket)
    |                   |
    |          Services Layer
    |          (Chat, Tickets, RAG,
    |           Copilot, KB, Auth,
    |           Analytics)
    |                   |
    |          Repositories
    |          (tenant-scoped queries)
    |                   |
    +----> Supabase (PostgreSQL + pgvector)
                        |
              Redis (cache, graceful degradation)
                        |
              EURI API (completions, embeddings)
```

Routes stay thin and only handle HTTP/WebSocket concerns; business logic lives in services;
all database access goes through tenant-scoped repositories. Full detail in
[CLAUDE.md](CLAUDE.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Three Interfaces, One App

| Interface | Routes | Audience |
|-----------|--------|----------|
| **Admin** | `/admin/*` | Dashboard, knowledge base management, agent management, analytics, AI settings |
| **Agent** | `/agent/*` | Dashboard, inbox, assigned tickets with copilot |
| **Customer** | `/`, `/chat`, `/tickets`, `/help` | Chat, ticket tracking, help center |

Role-based access is enforced on both sides: `useUser(requiredRole?)` on the frontend and
`require_role()` on the backend.

## Prerequisites

- **Python 3.11+** and **Node.js 20+** (this repo was tested on Node 24)
- A **Supabase** project (free tier works) — for the Postgres database + pgvector. Sign up at
  [supabase.com](https://supabase.com), create a project, and grab its URL and API keys from
  Project Settings → API.
- An **EURI API key** (Euron's OpenAI-compatible gateway) — used for chat completions and
  embeddings. See [euron.one](https://euron.one).
- Docker (optional) — only needed if you want Redis or the Docker Compose path.

## Quickstart

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env      # then fill in your Supabase + EURI credentials (see below)
uvicorn app.main:app --reload --port 8000

# 2. Apply the database schema (one-time, in the Supabase SQL editor)
# Paste and run, in order:
#   backend/supabase/migrations/001_initial_schema.sql
#   backend/supabase/migrations/002_knowledge_collections.sql

# 3. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev

# 4. Redis (optional — only needed for caching; the app runs fine without it)
docker run -p 6379:6379 redis:alpine
```

**What to put in `backend/.env`:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
(from your Supabase project settings) and `EURI_API_KEY` (from Euron) are the only values you
must supply yourself — everything else in `.env.example` already has a sensible default. See
the full list in [CLAUDE.md](CLAUDE.md#environment-variables).

Or bring up the whole stack with **Docker Compose** (still requires `backend/.env` filled in first):

```bash
docker compose up --build
```

Then open:
- Frontend: http://localhost:3000
- Backend docs (Swagger, interactive — try endpoints from the browser): http://localhost:8000/api/docs
- Health check: http://localhost:8000/health

## Troubleshooting

- **`ModuleNotFoundError` on backend startup** — you likely haven't run `pip install -r requirements.txt`
  in this exact environment/virtualenv yet.
- **`ValueError: password cannot be longer than 72 bytes` when hashing passwords** — this is a known
  incompatibility between `passlib` 1.7.4 and `bcrypt` 5.x. `requirements.txt` already pins
  `bcrypt>=4.0.1,<4.1` to avoid it; if you still hit it, run `pip install "bcrypt==4.0.1"`.
- **`ImportError: email-validator is not installed`** — also already pinned in `requirements.txt`;
  run `pip install -r requirements.txt` again if you installed packages individually before.
- **Frontend can't reach the backend** — check that `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
  matches the port your backend is actually running on (default `8000`).
- **Relation "knowledge_collections" does not exist** — you haven't run migration `002` yet; see
  step 2 above.

## Project Structure

```
backend/            FastAPI app
  app/routes/        Thin HTTP/WebSocket handlers (auth, chat, tickets, knowledge, copilot, admin, analytics, health)
  app/services/       Business logic
  app/repositories/   Tenant-scoped Supabase queries
  app/integrations/   EURI (OpenAI-compatible), Supabase, Redis clients
  app/tests/          58 pytest tests, all external services mocked
  supabase/migrations/ SQL migrations (schema + pgvector setup)

frontend/            Next.js app
  app/                admin/*, agent/*, and customer-facing routes (16 total)
  components/         Shared design-system components (ui/, layout/, chat/, tickets/, admin/)
  services/           API client wrappers, one per backend route group
  hooks/              useAuth, useUser, useTickets, useWebSocket

docs/                PRD, architecture, API spec, DB schema, deployment notes — see docs/README.md
                     for which of these reflect the current MVP vs. the long-term vision
.claude/             Engineering rules and Claude Code project configuration
prompts/             Append-only log of every prompt used to build this project
```

## API Overview

30 endpoints under `/api/v1`, grouped by area — full detail in [docs/API_SPEC.md](docs/API_SPEC.md)
(cross-check against `backend/app/routes/` for what's actually implemented vs. documented as
future scope):

| Group | Endpoints |
|-------|-----------|
| Auth | login, signup, refresh, me |
| Chat | completions (REST), history, `/ws/chat/{id}` (WebSocket) |
| Tickets | list, get, create, update, list/add messages |
| Conversations | list, get, create, update, list messages |
| Knowledge Base | list/upload/delete documents, ingest from URL, list/create collections |
| Copilot | suggest-reply, summarize, retrieve-kb |
| Admin | list/update agents, get/update AI config |
| Analytics | dashboard metrics |
| Health | health check (no auth) |

## Testing

```bash
cd backend
python -m pytest app/tests/ -v
```

58 tests across auth/RBAC, tickets, chat, knowledge base, copilot, admin, analytics, and health —
all external services (Supabase, EURI, Redis) are mocked, so tests run without any live credentials.

## Documentation

Start with [CLAUDE.md](CLAUDE.md) for the authoritative, current-state reference: full architecture,
API endpoints, database schema conventions, coding conventions, and implementation status (including
what's intentionally not yet built). Deeper topic docs live in [docs/](docs/README.md).

## License

Portfolio project — not licensed for reuse without permission.
