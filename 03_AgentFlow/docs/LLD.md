# AgentFlow — Low-Level Design

Module-by-module detail. For the system-level view, see [HLD.md](HLD.md).

## `backend/app/agents/base.py`

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

Every agent constructs its return value via `make_result(...)`, never a bare dict, so the shape can't drift silently.

## Agents

| Module | LLM calls | Tool calls | `steps` content |
|---|---|---|---|
| `simple.py` | 1 (fixed) | 0 | `["Answered directly"]` |
| `tool.py` | 1 per round (≤4) | 0–N | one entry per tool call + a final "Synthesized final answer" / "Answered directly without tools" |
| `router.py` | 2–3 depending on route | 0–1 | `"Classified as {route}"`, then a route-specific step, then `"Synthesized final answer"` |
| `react.py` | 1 per iteration (≤4) | 0–N | the raw Thought/Action or Final Answer text per iteration, plus `"Observation: ..."` entries |
| `planner.py` | 1 (plan) + 1 per step + 1 (synthesis) | 0–N | `"Generated plan with N steps"`, one entry per step, `"Synthesized final answer"` |

`tool.py` and `react.py` raise `RuntimeError` if they exceed their iteration bound without a final answer. `planner.py` raises `RuntimeError` if the plan JSON is malformed or empty.

## `backend/app/orchestration/`

- `classifier.classify(question) -> str` — one `chat()` call with `temperature=0`, JSON-only response `{"architecture": "..."}`; falls back to a token-guess on malformed JSON, and to `"Simple"` if the result isn't one of the five valid architecture names.
- `orchestrator.run(question, mode="auto") -> AgentResult` — builds its agent-module lookup **inside** the function body (not at import time) so `@patch("...orchestrator.tool")`-style test mocks are observed; `mode="auto"` calls `classify()` first, any other mode dispatches directly; unknown modes raise `ValueError`.
- `execution.execute(agent, question) -> AgentResult` — currently a one-line passthrough to `agent.run(question)`; exists as a seam for retry/timeout/logging logic that isn't needed yet (YAGNI).

## `backend/app/tools/`

- `calculator.py` — parses the expression with `ast.parse(mode="eval")`, walks the tree with a closed whitelist of node types (`Constant`, `BinOp`, `UnaryOp`) via `_safe_eval`; anything else raises `ValueError`, caught and returned as a `"Calculator error: ..."` string. Never raises out of `calculator()`.
- `search.py` — raises `backend.app.llm.euri_client.ConfigurationError` if `TAVILY_API_KEY` is unset; otherwise calls `TavilyClient.search(query, max_results=5)` and formats up to 5 results as numbered title/content/URL blocks.
- `registry.py` — `TOOL_DEFINITIONS` (OpenAI function-calling schema for calculator + search) and `execute_tool(name, arguments) -> str`, used by `tool.py`'s dynamic tool-calling loop.

## `backend/app/llm/euri_client.py`

```python
BASE_URL = EURI_BASE_URL   # from config.py, env EURI_BASE_URL, default euron.one endpoint
MODEL = EURI_MODEL         # from config.py, env EURI_MODEL, default "gpt-4.1-nano"

class ConfigurationError(RuntimeError): ...
def require_api_key() -> str          # reads EURI_API_KEY fresh each call, raises ConfigurationError if blank
def get_client() -> OpenAI            # OpenAI SDK client pointed at BASE_URL
def chat(messages, **kwargs) -> str   # one completion call, returns stripped content
```

## `backend/app/evaluation/`

- `metrics.estimate_cost_usd(llm_calls) -> float` — `llm_calls * AVG_TOKENS_PER_LLM_CALL / 1000 * COST_PER_1K_TOKENS_USD`, both constants explicitly commented as rough estimates, not billed cost.
- `metrics.aggregate(results) -> dict` — per-architecture averages (`count`, `avg_latency_ms`, `avg_llm_calls`, `avg_tool_calls`, `avg_cost_usd`); returns a zero-filled dict for an empty list rather than dividing by zero.
- `benchmark.TEST_PROMPTS` — the fixed 12-prompt list (id, prompt, mode) shared with `run_all.py` and the README's test matrix.
- `benchmark.run_benchmark() -> dict` — runs each prompt through `orchestrator.run`, catching exceptions per-prompt into an `errors` list so one failure doesn't abort the batch; groups successes by `architecture` and aggregates; always returns `"accuracy": "Not yet measured"`.

## `backend/app/main.py`

| Route | Method | Request | Response | Errors |
|---|---|---|---|---|
| `/api/health` | GET | — | `HealthResponse{euri_configured, tavily_configured}` | — |
| `/api/run` | POST | `RunRequest{query, mode="auto"}` | `RunResponse` (AgentResult fields + `estimated_cost_usd`) | 503 `ErrorResponse` on `ConfigurationError`, 500 on any other exception |
| `/api/benchmark` | POST | — | raw `run_benchmark()` dict | — |

CORS origins come from `config.CORS_ORIGINS` (env `AGENTFLOW_CORS_ORIGINS`, default `http://localhost:5173`).

## `frontend/src/`

- `services/api.js` — `getHealth()`, `runAgent(query, mode)`, `runBenchmark()`; throws on non-2xx with the backend's `error` field as the message.
- `hooks/useAgent.js` — wraps `runAgent` with `{result, error, loading}` state for `ConsolePage`.
- `pages/ConsolePage.jsx` — query textarea, a radio-button mode selector (`auto` + the 5 architecture ids from `data/architectures.js`), renders `ExecutionTrace` + the answer + call/latency/cost metrics on response.
- `pages/LandingPage.jsx` — composes all the presentational components in `components/` in the order: Navbar, Hero, ConsolePreview, ArchitectureComparison, HowItWorks, ToolSection, a static ExecutionTrace demo, EvaluationDashboard (hits `/api/benchmark` on click, never auto-run), ArchitectureDiagram, DemoSection, CTASection, Footer.

## Known follow-ups (not blocking, tracked for later)

- `router.py`'s `classify()` and `orchestration/classifier.py`'s `classify()` share near-identical JSON-parse-with-fallback logic — candidate for extraction into one shared helper.
- No error handling wraps mid-loop `search()`/`calculator()` calls inside `tool.py`/`react.py`/`planner.py`/`router.py` — currently fine because the outer layers (API's try/except, benchmark's per-prompt try/except, CLI's try/except) all catch cleanly, but a shared per-step try/except would make individual agent runs more resilient.
- `Response` models in `backend/app/schemas/responses.py` cover `/api/run`; `/api/benchmark` still returns a raw `dict` (no schema) — low priority since its shape is exploratory (evaluation output).

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
