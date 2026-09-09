# AgentFlow — High-Level Design

## 1. System Overview

```text
                         AGENTFLOW
                            │
                            ▼
                   ┌─────────────────┐
                   │  React + Vite   │
                   │    Frontend     │
                   └────────┬────────┘
                            │ REST (fetch)
                            ▼
                   ┌─────────────────┐
                   │     FastAPI     │
                   │   API Layer     │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Orchestrator   │
                   │ classify/route  │
                   └────────┬────────┘
                            │
          ┌─────────┬───────┼────────┬─────────┐
          ▼         ▼       ▼        ▼         ▼
       Simple     Tool    Router    ReAct    Planner
          │         │       │        │         │
          └─────────┴───────┴────────┴─────────┘
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
             EURI LLM          Tool Registry
                                      │
                               ┌──────┴──────┐
                               ▼             ▼
                          Calculator      Tavily Search
```

Agents use the LLM directly, and — where their strategy calls for it — the tool layer as well; the tool layer never calls the LLM itself.

### Architectural Principle

AgentFlow separates **architecture selection, execution, tools, and LLM access** into independent layers.

The orchestrator decides *which execution strategy to use*; individual agents decide *how that strategy executes the query*; the tool registry provides controlled external capabilities; and the EURI client isolates provider-specific LLM integration.

This separation allows each architecture to be tested, compared, and replaced independently.

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| API | FastAPI |
| Language | Python (backend), JavaScript (frontend) |
| LLM | EURI / OpenAI-compatible API |
| Web Search | Tavily |
| Validation | Pydantic |
| Testing | pytest |
| Package Management | uv (backend), npm (frontend) |
| Deployment | Docker + Docker Compose |

## 3. Components

**Frontend** (`frontend/`) — presentation only, no agent logic. Two routes: `/` (landing page) and `/console` (working query interface). Talks to the backend exclusively through `src/services/api.js`.

**API layer** (`backend/app/main.py`) — FastAPI app with three endpoints (`/api/run`, `/api/benchmark`, `/api/health`), Pydantic request/response schemas (`backend/app/schemas/`), and CORS configured for the frontend's dev origin.

**Orchestration** (`backend/app/orchestration/`) — owns architecture selection and dispatch. `classifier.py` makes one LLM call to select an architecture when `mode="auto"`. `orchestrator.py` dispatches to the selected (or explicitly requested) architecture. `execution.py` provides a future seam for cross-cutting execution concerns such as retries, timeouts, and logging.

**Agents** (`backend/app/agents/`) — five independent modules, each exposing `run(question) -> AgentResult`. `base.py` defines the shared contract so the frontend can render any architecture's trace identically.

**Tools** (`backend/app/tools/`) — `calculator.py` (AST-whitelist arithmetic, never raises), `search.py` (Tavily web search, raises `ConfigurationError` if unconfigured), `registry.py` (OpenAI-style function-calling schema + dispatch, used by the Tool agent).

**LLM client** (`backend/app/llm/euri_client.py`) — thin wrapper around the OpenAI SDK pointed at the EURI-compatible endpoint. Every other module calls the LLM only through `chat(messages, **kwargs)`.

**Evaluation** (`backend/app/evaluation/`) — `benchmark.py` runs 12 fixed prompts through the orchestrator; `metrics.py` aggregates real latency/LLM-call/tool-call counts and an estimated (not billed) cost. Accuracy is always reported as `"Not yet measured"`.

**CLI** (`cli/`) — five standalone scripts, each a thin wrapper calling one `backend.app.agents.*` module directly, for terminal demos independent of the API/frontend.

## 4. Unified Execution Contract

All five architectures return a common `AgentResult` structure:

| Field | Purpose |
|---|---|
| `architecture` | Architecture that executed the query |
| `answer` | Final generated response |
| `steps` | Execution trace |
| `tools_used` | Tools invoked during execution |
| `llm_calls` | Number of LLM calls |
| `tool_calls` | Number of tool calls |
| `latency_ms` | Measured execution latency |
| `route` | Router/classifier decision where applicable |

This contract decouples the frontend and evaluation layer from the individual agent implementations — it demonstrates interface-driven architecture, not just a shared return type.

## 5. Request Data Flow

```text
                       POST /api/run
                            │
                            ▼
                       mode == auto?
                      /             \
                    YES              NO
                     │                │
                     ▼                ▼
                Classifier      Requested mode
                     │                │
                     └───────┬────────┘
                             ▼
                       Agent.run()
                             │
                             ▼
                       AgentResult
```

1. Frontend console submits `{query, mode}` to `POST /api/run`.
2. If `mode == "auto"`, the orchestrator calls the classifier (one LLM call) to pick an architecture.
3. The orchestrator dispatches to that architecture's `run(question)`. The selected agent performs the LLM and tool calls required by its execution strategy, subject to its own configured iteration limits (see LLD.md for the exact bounds per architecture).
4. The API adds `estimated_cost_usd` and returns the full result.
5. The frontend renders `steps` as the execution trace and `answer` as the final response.

Manual mode (`mode` set to an explicit architecture) skips the classifier entirely and dispatches straight to the requested agent — this is what makes controlled architecture-to-architecture comparison possible, while auto mode demonstrates the orchestration itself.

## 6. Dependency Boundaries

```text
Frontend
   │
   ▼
API
   │
   ▼
Orchestration
   │
   ▼
Agents
   │
   ├──────► LLM Client
   │
   └──────► Tools
```

- Frontend depends only on the HTTP API.
- API depends on schemas and orchestration.
- Orchestration depends on the agent interface (`run(question) -> AgentResult`), not on any agent's internals.
- Agents depend on the LLM abstraction and whichever tools their strategy needs.
- Tools do not depend on frontend or API code.
- EURI-specific implementation is isolated behind the LLM client.

## 7. Cross-Cutting Concerns

- **Error handling:** `ConfigurationError` (missing API key) → HTTP 503; any other exception → HTTP 500. The benchmark harness catches per-prompt exceptions so one bad prompt doesn't abort the batch.
- **Configuration:** all environment variable reads are centralized in `backend/app/config.py`.
- **Testing:** all external calls (EURI, Tavily) are mocked in the 41-test suite — no live network calls in CI.
- **Security:** secrets never committed (`.env`, `frontend/.env` gitignored); calculator uses an AST whitelist instead of `eval()`.
- **Observability:** every response carries its own latency, LLM-call count, tool-call count, and execution trace — instrumentation is part of the response contract, not a side channel.

## 8. Evaluation Architecture

`POST /api/benchmark` (and `uv run run_all.py`) run the 12 test prompts and report real, measured metrics per architecture: average latency, LLM call count, tool call count, and an estimated (not billed) cost. Accuracy is always `"Not yet measured"`.

Metrics are instrumentation of actual execution behavior and are not treated as quality scores. Accuracy evaluation remains deferred until a labeled benchmark dataset and scoring methodology are introduced — low latency does not imply high answer quality, and this system doesn't claim otherwise.

## 9. Deployment

AgentFlow is packaged as two containers:

- **Frontend:** React/Vite production build, served by nginx (`frontend/Dockerfile`, multi-stage — the container never runs the Vite dev server).
- **Backend:** FastAPI/Uvicorn (`backend/Dockerfile`, `uv`-managed dependencies).

Docker Compose provides a single-command local deployment:

```bash
docker compose up --build
```

The frontend communicates with the backend through `VITE_API_URL`, a build-time argument (Vite inlines `VITE_*` variables at build time) resolved by the browser against the backend's host-mapped port — not by the frontend container itself. No API key is ever baked into either image; both are injected at container runtime via `env_file`.

## 10. Key Architectural Decisions

**Common agent contract.** All architectures return `AgentResult`, allowing the API, console, benchmarking, and evaluation layers to remain architecture-agnostic.

**LLM provider isolation.** EURI-specific SDK configuration is isolated in `llm/euri_client.py`, preventing provider-specific concerns from leaking into agent logic.

**Centralized tool registry.** Tools are registered and dispatched through a common registry, making additional tools easier to introduce without changing the API layer.

**Safe calculator.** Arithmetic is evaluated using an AST whitelist rather than Python `eval()`, preventing arbitrary code execution.

**Separate orchestrator.** Architecture selection and dispatch remain outside individual agents, keeping agents independently testable.

**No fabricated evaluation.** The evaluation layer reports measured operational metrics and does not invent accuracy results without a labeled evaluation dataset.

## 11. Future Evolution

See PRD.md §14 (Future Considerations) for capabilities under consideration beyond the current MVP — this document describes the system as built, not a roadmap.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
