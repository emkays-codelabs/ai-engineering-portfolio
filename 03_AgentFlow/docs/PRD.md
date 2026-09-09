# AgentFlow — Product Requirements Document

## 1. Problem

AI agent systems can use very different execution strategies: answer directly, invoke tools, route a query to a specialized workflow, reason iteratively, or create and execute a plan.

Each strategy introduces different trade-offs in complexity, latency, cost, tool usage, and observability. Yet many agent implementations demonstrate only a single architecture, making these trade-offs difficult to compare or evaluate.

AgentFlow addresses this by implementing multiple agent architectures behind a common interface and making their execution behavior measurable and observable.

## 2. Product

AgentFlow is a multi-architecture AI agent orchestration platform that provides five execution strategies — Simple, Tool-Using, Router, ReAct, and Planning — through a unified interface.

For `mode="auto"`, an LLM-based classifier analyzes the query and selects an appropriate architecture. Users can also explicitly select an architecture to compare behavior directly.

Each execution produces a standardized result containing the answer, architecture used, tool activity, LLM call count, latency, and execution trace where applicable.

AgentFlow is not selecting the "best agent." It selects an appropriate execution strategy for the task — the objective is not to identify one universally superior architecture, but to make the trade-offs between architectures observable.

## 3. Goals

- Let a user (or the frontend console) submit one query and get an answer without knowing which architecture handled it (`mode="auto"`).
- Let a user force a specific architecture to compare behavior directly (`mode="simple"|"tool"|"router"|"react"|"planner"`).
- Make execution observable: every response includes a step-by-step trace, tool calls, LLM call count, and latency.
- Measure architectures honestly: report real latency/cost/call-count metrics from actual runs; never fabricate an accuracy number without a labeled test set.

## 4. MVP Scope

The current MVP focuses on:

- Five agent architectures (Simple, Tool-Using, Router, ReAct, Planner)
- Automatic architecture selection via an LLM classifier
- Manual architecture selection for direct comparison
- Calculator and web-search tools
- A unified `AgentResult` contract across all five architectures
- Execution tracing (`steps`) for every run
- A fixed-prompt benchmark suite
- Latency, LLM-call, tool-call, and estimated-cost instrumentation
- A FastAPI HTTP API (`/api/run`, `/api/benchmark`, `/api/health`)
- A React console (query box, mode selector, execution trace, evaluation dashboard)
- CLI entry points for standalone demonstration of each architecture
- Automated backend testing (mocked, no live network calls)
- Docker-based local deployment (backend + frontend containers via Docker Compose)

## 5. Non-Goals (current phase)

- Real accuracy scoring (needs a labeled test set with expected answers — not built yet).
- Persistence, conversation history, authentication, multi-tenant usage.
- Streaming/live step-by-step delivery over the API (the MVP returns one complete response per run).
- Additional tools beyond calculator and web search.

## 6. Users

### Primary User

Developers and AI engineers evaluating different agent execution architectures for a given task.

### Secondary User

Technical teams exploring agent orchestration patterns, tool use, reasoning strategies, and execution trade-offs.

### Demonstration User

The project author, using the CLI, benchmark harness, and console for technical demonstrations and portfolio evaluation.

## 7. User Stories

- As a developer, I can submit a query with `mode="auto"` and get an answer without deciding up front which agent architecture should handle it.
- As a developer comparing architectures, I can submit the same query with an explicit `mode` and see how each architecture's trace, tool usage, and latency differ.
- As a developer evaluating cost/latency trade-offs, I can run the fixed benchmark suite and get per-architecture aggregated metrics without writing my own harness.
- As a developer inspecting reliability, I can see that a missing API key produces a clear `ConfigurationError` (HTTP 503) rather than a raw SDK stack trace or a silent failure.
- As a developer extending the tool layer, I can add a new tool through the central registry without changing agent or API code.

## 8. Functional Requirements

| # | Requirement | Status |
|---|---|---|
| 1 | Five independently correct agent architectures, each returning a uniform result shape | Done — `backend/app/agents/` |
| 2 | Automatic architecture selection via an LLM classifier | Done — `backend/app/orchestration/classifier.py` |
| 3 | Manual architecture override | Done — `orchestrator.run(question, mode=...)` |
| 4 | HTTP API exposing run/benchmark/health | Done — `backend/app/main.py` |
| 5 | Real, non-fabricated evaluation metrics | Done — `backend/app/evaluation/` |
| 6 | Web UI: landing page explaining the platform + a working console | Implemented — functional; visual refinement ongoing |
| 7 | CLI entry points for standalone demo use | Done — `cli/` |
| 8 | 12+ test prompts documented with rationale | Done — see README's benchmark suite section |
| 9 | Docker-based local deployment | Done — `docker-compose.yml`, verified working end-to-end |

## 9. API Requirements

### `POST /api/run`

Accepts:

- `query` — the natural-language question
- `mode` — one of `auto`, `simple`, `tool`, `router`, `react`, `planner`

Returns:

- selected architecture
- final answer
- tools used
- LLM call count
- tool call count
- latency
- execution trace (`steps`)
- route (Math/Coding/Research/General, Router only)
- estimated cost

### `GET /api/health`

Returns whether `EURI_API_KEY`/`TAVILY_API_KEY` are configured (booleans only, never key values).

### `POST /api/benchmark`

Runs the fixed benchmark suite (12 prompts across all five architectures) and returns measured execution metrics, aggregated per architecture.

## 10. Non-Functional Requirements

### Reliability

- Agent execution must fail gracefully with a distinguishable error type (`ConfigurationError` vs. any other exception).
- ReAct and Tool-Using agents must have bounded iteration counts to prevent unbounded loops.
- Benchmark execution must isolate individual prompt failures so one bad prompt doesn't abort the batch.

### Security

- API keys must never be committed to source control (`.env`, `frontend/.env` are gitignored).
- Calculator evaluation must not execute arbitrary Python code.
- Tool inputs are passed through a typed registry rather than evaluated directly.

### Observability

- Record execution latency for every run.
- Record LLM call count and tool call count for every run.
- Preserve the architecture selected and its full execution trace.

### Maintainability

- All agents implement a common result contract (`AgentResult` / `make_result()`).
- Provider-specific LLM code stays isolated behind `backend/app/llm/euri_client.py`.
- Tools are registered and dispatched through a centralized tool registry.

### Testability

- Backend tests must not require live external API calls.
- External services (EURI, Tavily) must be mockable at the boundary they're called through.

## 11. Evaluation Principles

AgentFlow reports measured system behavior rather than fabricated performance claims.

Currently measured, from actual runs:

- Latency
- LLM call count
- Tool call count
- Estimated cost (derived from a rough tokens-per-call constant, explicitly not billed cost)

Accuracy is intentionally not reported because the MVP does not yet contain a labeled evaluation dataset with expected answers. Future accuracy evaluation requires a versioned benchmark dataset and a defined scoring methodology — not a number invented in the meantime.

## 12. Acceptance Criteria

**AC-01 — Automatic Selection.** Given a supported query and `mode="auto"`, AgentFlow selects one of the five supported architectures and executes it successfully.

**AC-02 — Manual Selection.** Given a valid architecture mode, AgentFlow executes the requested architecture without invoking automatic selection.

**AC-03 — Unified Result.** Every successful agent execution returns the standardized `AgentResult` contract.

**AC-04 — Tool Safety.** Calculator execution cannot execute arbitrary Python expressions.

**AC-05 — Bounded Execution.** ReAct and Tool-Using agents terminate within their configured iteration limits.

**AC-06 — Observability.** Each execution exposes latency, LLM calls, tool calls, and applicable execution trace information.

**AC-07 — Testing.** The complete backend test suite passes without requiring live external API calls.

**AC-08 — Secrets.** No API credentials are stored in source control.

## 13. Success Criteria

- All 41 backend tests pass with zero live network calls.
- Each of the five architectures can be demoed live via the CLI and the console.
- The comparison table and benchmark suite in the README accurately describe observed behavior.
- No API keys are committed to the repository.

## 14. Future Considerations

Potential future capabilities — not MVP promises:

- Persistent conversations
- Authentication and multi-user support
- Streaming execution traces
- Additional tools
- Labeled accuracy evaluation
- Cost-aware architecture selection
- More advanced evaluation datasets
- Pluggable LLM providers

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
