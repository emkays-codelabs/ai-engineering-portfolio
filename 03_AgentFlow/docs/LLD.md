# AgentFlow — Low-Level Design

This document defines the module-level design, interfaces, execution contracts, validation behavior, error handling, and implementation boundaries of AgentFlow.

For system-level architecture and component relationships, see [HLD.md](HLD.md). The design is intentionally aligned with the current MVP implementation; future capabilities are identified separately (see PRD.md §14) and are not treated as implemented behavior.

## 1. Shared Agent Contract

### `backend/app/agents/base.py`

All five agent implementations conform to the same execution contract:

```text
Agent.run(question) -> AgentResult
```

```python
class AgentResult(TypedDict):
    architecture: str
    answer: str
    steps: list[str]
    tools_used: list[str]
    llm_calls: int
    tool_calls: int
    latency_ms: int
    route: Optional[str]  # set only by router.py

def make_result(*, architecture, answer, steps, tools_used, llm_calls, tool_calls, latency_ms, route=None) -> AgentResult
```

`make_result(...)` is the single construction path for a successful agent result — every agent uses it, never a bare dict — preventing individual implementations from silently drifting from the shared response shape.

## 2. Agent Implementations

| Agent | Primary purpose | LLM calls | Tools | Iterative? | Output |
|---|---|---|---|---|---|
| `simple.py` | Direct response | 1 (fixed) | None | No | `AgentResult` |
| `tool.py` | Dynamic tool calling | 1 per round (≤4) | Calculator/Search | Yes | `AgentResult` |
| `router.py` | Classify then specialize | 2–3 depending on route | 0–1 | Limited (one route, no loop) | `AgentResult` |
| `react.py` | Iterative reasoning/action | 1 per iteration (≤4) | Calculator/Search | Yes | `AgentResult` |
| `planner.py` | Plan → execute → synthesize | 1 (plan) + 1 per step + 1 (synthesis) | Calculator/Search | Yes | `AgentResult` |

`steps` content per agent:

- `simple.py` — `["Answered directly"]`
- `tool.py` — one entry per tool call, plus a final `"Synthesized final answer"` / `"Answered directly without tools"`
- `router.py` — `"Classified as {route}"`, then a route-specific step, then `"Synthesized final answer"`
- `react.py` — the raw Thought/Action or Final Answer text per iteration, plus `"Observation: ..."` entries
- `planner.py` — `"Generated plan with N steps"`, one entry per step, `"Synthesized final answer"`

`tool.py` and `react.py` raise `RuntimeError` if they exceed their iteration bound without a final answer. `planner.py` raises `RuntimeError` if the plan JSON is malformed or empty.

## 3. Orchestration

### Classifier Contract

```text
classify(question) -> architecture
```

Valid architecture values: `Simple`, `Tool`, `Router`, `ReAct`, `Planner`.

The classifier requests JSON in the form `{"architecture": "Simple"}` via one `chat()` call with `temperature=0`. Malformed or unsupported classifier output is normalized through fallback logic (a best-effort token scan, then a default of `"Simple"`) rather than being allowed to propagate an invalid architecture into the dispatcher.

### Auto vs. Manual Dispatch

```text
POST /api/run
      │
      ▼
   mode?
   /   \
auto   explicit
 │        │
 ▼        │
classify  │
 │        │
 └───┬────┘
     ▼
orchestrator
     │
     ▼
Agent.run()
     │
     ▼
AgentResult
```

`mode="auto"` introduces one classifier LLM call before execution. An explicit architecture mode bypasses the classifier and dispatches directly to the requested agent — this is what makes controlled architectural comparison possible, while auto mode demonstrates the orchestration itself.

`orchestrator.run(question, mode="auto") -> AgentResult` builds its agent-module lookup **inside** the function body (not at import time) so `@patch("...orchestrator.tool")`-style test mocks are observed. Unknown modes raise `ValueError`.

### `execution.py`

`execution.py` currently provides a thin execution abstraction around `agent.run(question)`. It intentionally contains no retry, timeout, or logging behavior in the MVP. The abstraction provides a future extension point for cross-cutting execution concerns without coupling those concerns to individual agents.

## 4. Tool Layer

### Tool Contracts

**Calculator**

```text
calculator(expression: str) -> str
```

Properties: local execution, AST-based parsing (`ast.parse(mode="eval")`), a closed node whitelist (`Constant`, `BinOp`, `UnaryOp`), no arbitrary Python execution, errors converted to result strings (never raises out of `calculator()`).

**Search**

```text
search(query: str) -> str
```

Properties: Tavily-backed, maximum 5 results, requires `TAVILY_API_KEY`, raises `ConfigurationError` on missing configuration.

**Registry**

```text
execute_tool(name: str, arguments: dict) -> str
```

`TOOL_DEFINITIONS` holds the OpenAI-style function-calling schema for calculator + search. `execute_tool` provides the dispatch boundary between an agent's tool calls and the concrete tool implementations, used by `tool.py`'s dynamic tool-calling loop.

## 5. LLM Integration

### `backend/app/llm/euri_client.py`

```python
BASE_URL = EURI_BASE_URL   # from config.py, env EURI_BASE_URL, default euron.one endpoint
MODEL = EURI_MODEL         # from config.py, env EURI_MODEL, default "gpt-4.1-nano"

class ConfigurationError(RuntimeError): ...
def require_api_key() -> str          # reads EURI_API_KEY fresh each call, raises ConfigurationError if blank
def get_client() -> OpenAI            # OpenAI SDK client pointed at BASE_URL
def chat(messages, **kwargs) -> str   # one completion call, returns stripped content
```

This is the only module that knows about the EURI/OpenAI SDK — every other module calls the LLM only through `chat(messages, **kwargs)`.

### Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `EURI_API_KEY` | Yes, for any LLM call | — | EURI authentication |
| `EURI_MODEL` | No | `gpt-4.1-nano` | LLM model |
| `EURI_BASE_URL` | No | EURI endpoint | OpenAI-compatible API endpoint |
| `TAVILY_API_KEY` | Yes, for search | — | Tavily authentication |
| `AGENTFLOW_CORS_ORIGINS` | No | `http://localhost:5173` | Frontend CORS origin(s), comma-separated |

## 6. Evaluation

- `metrics.estimate_cost_usd(llm_calls) -> float` — `llm_calls * AVG_TOKENS_PER_LLM_CALL / 1000 * COST_PER_1K_TOKENS_USD`, both constants explicitly commented as rough estimates, not billed cost.
- `metrics.aggregate(results) -> dict` — per-architecture averages (`count`, `avg_latency_ms`, `avg_llm_calls`, `avg_tool_calls`, `avg_cost_usd`); returns a zero-filled dict for an empty list rather than dividing by zero.
- `benchmark.TEST_PROMPTS` — the fixed 12-prompt list (id, prompt, mode) shared with `run_all.py` and the README's benchmark suite section.
- `benchmark.run_benchmark() -> dict` — runs each prompt through `orchestrator.run`, catching exceptions per-prompt into an `errors` list so one failure doesn't abort the batch; groups successes by `architecture` and aggregates; always returns `"accuracy": "Not yet measured"`.

### Accuracy

Accuracy is intentionally represented as `"Not yet measured"`. The MVP does not contain a labeled dataset or expected-answer evaluation framework. Operational metrics such as latency, LLM calls, and tool calls are therefore reported separately from answer quality — a fast response is not reported or implied to be a correct one.

## 7. API Layer

| Route | Method | Request | Response | Errors |
|---|---|---|---|---|
| `/api/health` | GET | — | `HealthResponse{euri_configured, tavily_configured}` | — |
| `/api/run` | POST | `RunRequest{query, mode="auto"}` | `RunResponse` (AgentResult fields + `estimated_cost_usd`) | 503 `ErrorResponse` on `ConfigurationError`, 500 on any other exception |
| `/api/benchmark` | POST | — | raw `run_benchmark()` dict | — |

CORS origins come from `config.CORS_ORIGINS` (env `AGENTFLOW_CORS_ORIGINS`, default `http://localhost:5173`).

### Illustrative request/response

Illustrative only — not a captured live response, consistent with this project's rule against presenting invented output as measured fact.

Request:

```json
POST /api/run
{
  "query": "Calculate 125 * 48",
  "mode": "auto"
}
```

Response:

```json
{
  "architecture": "Tool Agent",
  "answer": "125 x 48 = 6000",
  "steps": ["Called calculator({'expression': '125 * 48'})", "Synthesized final answer"],
  "tools_used": ["calculator"],
  "llm_calls": 2,
  "tool_calls": 1,
  "latency_ms": 842,
  "route": null,
  "estimated_cost_usd": 0.0006
}
```

### Error Ownership

| Error | Owner | Behavior |
|---|---|---|
| Missing EURI key | LLM client | `ConfigurationError` → HTTP 503 |
| Missing Tavily key | Search tool | `ConfigurationError` → HTTP 503 |
| Invalid calculator expression | Calculator | Returns an error string, never raises |
| Invalid architecture mode | Orchestrator | `ValueError` → HTTP 500 |
| Agent iteration exhausted | Agent (Tool/ReAct) | `RuntimeError` → HTTP 500 |
| Unexpected exception | API | HTTP 500 |

## 8. Frontend

- `services/api.js` — `getHealth()`, `runAgent(query, mode)`, `runBenchmark()`; throws on non-2xx with the backend's `error` field as the message.
- `hooks/useAgent.js` — wraps `runAgent` with `{result, error, loading}` state for `ConsolePage`.
- `pages/ConsolePage.jsx` — query textarea, a radio-button mode selector (`auto` + the 5 architecture ids from `data/architectures.js`), renders `ExecutionTrace` + the answer + call/latency/cost metrics on response.
- `pages/LandingPage.jsx` — composes all the presentational components in `components/` in order: Navbar, Hero, ConsolePreview, ArchitectureComparison, HowItWorks, ToolSection, a static ExecutionTrace demo, EvaluationDashboard (hits `/api/benchmark` on click, never auto-run), ArchitectureDiagram, DemoSection, CTASection, Footer.

### Frontend Boundary

The frontend contains no agent-selection, tool-execution, or LLM logic. Its responsibilities are limited to: collecting user input, selecting execution mode, calling the API, rendering `AgentResult`, and displaying execution and evaluation information.

## 9. Testing Strategy

```text
backend/tests/
│
├── Agent behavior      (test_agents_*.py, test_agent_base.py)
├── Tool behavior        (test_tools.py)
├── Classifier            (test_classifier.py)
├── Orchestrator          (test_orchestrator.py)
├── Evaluation            (test_metrics.py, test_benchmark.py)
├── API                   (test_api.py)
└── LLM client            (test_euri_client.py)
```

External EURI and Tavily calls are mocked at their respective boundaries (`euri_client.chat`, `tools.search`). Tests therefore validate control flow, contracts, and error handling without requiring external network access — 41 tests, all passing, zero live calls.

## 10. Known Limitations & Follow-Ups

**Low priority**

- `router.py`'s `classify()` and `orchestration/classifier.py`'s `classify()` share near-identical JSON-parse-with-fallback logic — candidate for extraction into one shared helper.
- `Response` models in `backend/app/schemas/responses.py` cover `/api/run`; `/api/benchmark` still returns a raw `dict` (no schema) — low priority since its shape is exploratory (evaluation output).

**Reliability improvement**

- No error handling wraps mid-loop `search()`/`calculator()` calls inside `tool.py`/`react.py`/`planner.py`/`router.py` — currently fine because the outer layers (API's try/except, benchmark's per-prompt try/except, CLI's try/except) all catch cleanly, but a shared per-step try/except would make individual agent runs more resilient.

**Future capability**

- Retries and timeout handling in `execution.py` (see §3).
- Richer evaluation once a labeled dataset exists (see PRD.md §14).

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
