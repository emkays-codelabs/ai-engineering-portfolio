# AgentFlow — High-Level Design

## System overview

```text
             ┌────────────────────────┐
             │      AGENTFLOW         │
             │       Frontend         │
             │  (React + Vite, SPA)   │
             └───────────┬────────────┘
                         │  REST (fetch)
             ┌───────────▼────────────┐
             │      FastAPI API       │
             │  backend/app/main.py   │
             └───────────┬────────────┘
                         │
             ┌───────────▼────────────┐
             │     ORCHESTRATOR       │
             │ classify → dispatch    │
             └───────────┬────────────┘
                         │
       ┌───────┬─────────┼─────────┬───────┐
       ▼       ▼         ▼         ▼       ▼
    Simple   Tool      Router     ReAct  Planner
       │       │         │         │       │
       └───────┴────┬────┴─────────┴───────┘
                    ▼
              TOOL REGISTRY
             ┌──────┴──────┐
             ▼             ▼
        Calculator      Search (Tavily)
                    │
                    ▼
                EURI LLM
```

## Components

**Frontend** (`frontend/`) — presentation only, no agent logic. Two routes: `/` (landing page) and `/console` (working query interface). Talks to the backend exclusively through `src/services/api.js`.

**API layer** (`backend/app/main.py`) — FastAPI app with three endpoints (`/api/run`, `/api/benchmark`, `/api/health`), Pydantic request/response schemas (`backend/app/schemas/`), and CORS configured for the frontend's dev origin.

**Orchestration** (`backend/app/orchestration/`) — `classifier.py` makes one LLM call to pick an architecture (`mode="auto"`); `orchestrator.py` dispatches to the chosen (or explicitly requested) architecture; `execution.py` is a thin seam reserved for future cross-cutting concerns (retries, timeouts, logging) without agents needing to know about them.

**Agents** (`backend/app/agents/`) — five independent modules, each exposing `run(question) -> AgentResult`. `base.py` defines the shared `AgentResult` contract (architecture, answer, steps, tools_used, llm_calls, tool_calls, latency_ms, route) so the frontend can render any architecture's trace identically.

**Tools** (`backend/app/tools/`) — `calculator.py` (AST-whitelist arithmetic, never raises), `search.py` (Tavily web search, raises `ConfigurationError` if unconfigured), `registry.py` (OpenAI-style function-calling schema + dispatch, used by the Tool agent).

**LLM client** (`backend/app/llm/euri_client.py`) — thin wrapper around the OpenAI SDK pointed at the EURI-compatible endpoint. Every other module calls the LLM only through `chat(messages, **kwargs)`.

**Evaluation** (`backend/app/evaluation/`) — `benchmark.py` runs 12 fixed prompts through the orchestrator; `metrics.py` aggregates real latency/LLM-call/tool-call counts and an estimated (not billed) cost. Accuracy is always reported as `"Not yet measured"`.

**CLI** (`cli/`) — five standalone scripts, each a thin wrapper calling one `backend.app.agents.*` module directly, for terminal demos independent of the API/frontend.

## Data flow — one request

1. Frontend console submits `{query, mode}` to `POST /api/run`.
2. If `mode == "auto"`, the orchestrator calls the classifier (one LLM call) to pick an architecture.
3. The orchestrator dispatches to that architecture's `run(question)`.
4. The agent makes its own LLM/tool calls (0–5 depending on architecture) and returns an `AgentResult`.
5. The API adds `estimated_cost_usd` and returns the full result.
6. The frontend renders `steps` as the execution trace and `answer` as the final response.

## Cross-cutting concerns

- **Error handling:** `ConfigurationError` (missing API key) → HTTP 503; any other exception → HTTP 500. The benchmark harness catches per-prompt exceptions so one bad prompt doesn't abort the batch.
- **Configuration:** all environment variable reads are centralized in `backend/app/config.py`.
- **Testing:** all external calls (EURI, Tavily) are mocked in the 41-test suite — no live network calls in CI.

## Deployment (current state)

No containerization yet. Backend runs via `uv run uvicorn backend.app.main:app`; frontend runs via `npm run dev` (or is built and served statically). A `docker-compose.yml` wiring the two together is a planned addition, not yet built.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
