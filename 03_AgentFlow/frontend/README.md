# AgentFlow — Frontend

React + Vite landing page and console UI for [AgentFlow](../README.md), the multi-architecture AI agent orchestration platform.

## Setup

```bash
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to point at the running backend (defaults to `http://localhost:8000`; see the [backend setup](../README.md#backend)).

## Develop

```bash
npm run dev
```

- `/` — landing page (architecture overview, tool ecosystem, evaluation dashboard, demo section).
- `/console` — the working AgentFlow console: enter a query, pick Auto or a specific architecture, see the live execution trace and answer.

## Build

```bash
npm run build
```

> **Windows note:** if your project path contains an `&`, `npm run <script>` may fail with a `cmd.exe` "not recognized" error — a Windows shell quirk with `&` in paths, not a project bug. Work around it with `node node_modules/vite/bin/vite.js <dev|build>` instead.

## Structure

```text
src/
├── components/   # presentational building blocks (Navbar, Hero, ArchitectureCard, …)
├── pages/        # LandingPage, ConsolePage
├── services/     # api.js — fetch wrapper over the backend's /api/* endpoints
├── hooks/        # useAgent.js — query/loading/error state for a single agent run
└── data/         # architectures.js — static metadata for the 5 architectures
```

The frontend contains no agent logic — it only calls the backend API and renders what comes back, including the honest `"Not yet measured"` accuracy value from `/api/benchmark` (never a fabricated number).

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
