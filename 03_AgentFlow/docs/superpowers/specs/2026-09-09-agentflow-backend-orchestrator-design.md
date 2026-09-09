# AgentFlow — Phase 1 Design: Backend Orchestrator

## Context

This project started as a course assignment ("Build and Compare Different Agent Types") with five independent CLI scripts: Simple, Tool-Using, Router, ReAct, and Planning agents, sharing an EURI LLM client and two tools (calculator, Tavily search). That code works and is committed.

The project is being evolved into **AgentFlow**, a portfolio-grade AI agent orchestration platform: instead of the user picking an architecture, an orchestrator classifies the query and automatically selects Simple, Tool, Router, ReAct, or Planner to handle it. A React console and landing page will sit on top of this backend in later phases.

This document specs **Phase 1 only**: the FastAPI backend that wraps the existing agents behind an orchestration layer, ready for a frontend to call.

Phases 2–4 (Console UI, Landing Page, Evaluation dashboard UI) are separate specs, built after this one.

## Goals

- Reuse the existing, working agent logic — no rewrites of the core reasoning loops.
- Add an orchestrator that auto-selects an architecture via an LLM classifier.
- Give every architecture a uniform result shape (including a `steps` trace) so a frontend can render any of them the same way.
- Expose everything over a small FastAPI surface: run an agent (auto or manual), run the benchmark suite, check configuration health.
- Keep metrics honest: real latency/LLM-calls/tool-calls/estimated-cost from actual runs; no fabricated accuracy numbers.

## Non-Goals (explicitly deferred)

- Streaming/live step-by-step delivery (SSE/WebSocket) — MVP returns one complete response per run.
- Persistence, conversation history, auth, Docker, database — V2 per the product roadmap.
- Real accuracy scoring — would require a labeled test set with expected answers that doesn't exist yet. The MVP labels accuracy "Not yet measured" rather than inventing a percentage.

## Project Layout

```
backend/
├── api/
│   └── main.py              # FastAPI app, CORS, routes
├── agents/                  # moved from root agents/, uniform trace return
│   ├── base.py               # AgentResult schema shared by all five
│   ├── simple.py
│   ├── tool.py
│   ├── router.py
│   ├── react.py
│   └── planner.py
├── orchestration/
│   ├── classifier.py         # LLM call: query -> one of 5 architecture names
│   └── orchestrator.py       # dispatch to chosen agent, wrap timing/metrics
├── tools/
│   ├── calculator.py
│   ├── search.py
│   └── registry.py           # TOOL_DEFINITIONS + execute_tool, moved from core/tools.py
├── llm/
│   └── euri_client.py        # moved from core/llm_client.py
└── evaluation/
    ├── benchmark.py          # runs the fixed test-prompt set through the orchestrator
    └── metrics.py            # latency/LLM-calls/tool-calls aggregation, cost estimate
```

The existing root-level `agents/` and `core/` packages are retired in favor of `backend/agents/` and `backend/{llm,tools}/`. A thin `cli.py` (or equivalent) preserves the original `python <agent>.py "question"` usability by calling into the `backend.agents.*` modules, so the CLI demo path used in the course video still works without duplicated logic.

## Data Contract

Every agent function returns the same shape, regardless of architecture:

```python
class AgentResult(TypedDict):
    architecture: str          # "Simple" | "Tool" | "Router" | "ReAct" | "Planner"
    answer: str
    steps: list[str]           # uniform trace, at least one entry for every architecture
    tools_used: list[str]
    llm_calls: int
    tool_calls: int
    latency_ms: int
    route: str | None          # only Router sets this (Math/Coding/Research/General)
```

Simple, Tool, and Router currently return only a final answer and which tool was used; they gain a `steps` list (e.g. Simple = `["Answered directly"]`, Tool = `["Called calculator", "Synthesized final answer"]`, Router = `["Classified as Math", "Called calculator", "Synthesized final answer"]`) so the frontend's Execution Trace view works identically for all five.

## API Endpoints

### `POST /api/run`

Request:
```json
{"query": "string", "mode": "auto" | "simple" | "tool" | "router" | "react" | "planner"}
```

Behavior: `mode: "auto"` calls the classifier first, then dispatches to the returned architecture. Any other `mode` value skips the classifier and calls that architecture directly (manual/compare mode from the Console).

Response: the `AgentResult` above, plus:
```json
{"estimated_cost_usd": 0.00}
```
Cost is computed from a configurable `$ per 1K tokens` constant applied to token counts reported by the EURI/OpenAI SDK response — clearly an *estimate*, not billed cost (EURI's API doesn't expose real billing data).

### `POST /api/benchmark`

Runs the fixed test-prompt set (the 12 prompts already defined in `run_all.py`) across all five architectures via the orchestrator. Returns each prompt's `AgentResult` plus aggregated per-architecture averages: latency, LLM calls, tool calls, estimated cost. No `accuracy` field in the MVP.

### `GET /api/health`

Returns `{"euri_configured": bool, "tavily_configured": bool}` — booleans only, never key values — so the frontend can show "not configured" instead of surfacing a raw error.

## Classifier

One LLM call, same JSON-only pattern as the existing `router_agent.classify()`, extended to choose among all five architectures instead of four domains:

```json
{"architecture": "Simple" | "Tool" | "Router" | "ReAct" | "Planner"}
```

The system prompt encodes the same decision spectrum from the product spec (low → high complexity: Simple → Tool → Router → ReAct → Planner) as guidance text, not as hard rules — the LLM makes the final call per query.

## Error Handling

- Missing `EURI_API_KEY` or `TAVILY_API_KEY` (when the query needs search) → `503` with a JSON body naming the missing variable, never a raw stack trace.
- Any other agent/tool exception during a run is caught per-request and returned as `{"error": "..."}` with `500`, so one bad prompt doesn't take down the server or abort a batch benchmark run.
- CORS is enabled for the frontend's dev origin (and configurable via env for the deployed origin later).

## Testing

- Unit tests per agent module, asserting the `AgentResult` shape (all required keys present, `steps` non-empty).
- Classifier test with a mocked LLM response, asserting it maps known query patterns to the expected architecture.
- API tests hitting `/api/run`, `/api/benchmark`, `/api/health` with the EURI and Tavily clients mocked — no real network calls in the test suite.

## Open Items Carried to Later Phases

- Console UI (Phase 2) consumes `/api/run` and `/api/benchmark`; auto vs. manual toggle maps directly to the `mode` field.
- Landing page (Phase 3) is static/marketing and doesn't call the API except linking to the Console.
- Evaluation dashboard (Phase 4) is a UI over `/api/benchmark`'s output — no new backend work expected beyond what's specced here.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
