<a id="top"></a>

# AgentFlow

**Multi-Architecture AI Agent Orchestration Platform**

> The right agent architecture for every task.

AgentFlow automatically selects and executes the right agent strategy — from direct LLM responses to tool use, routing, ReAct, and multi-step planning — and shows exactly how it solved each task.

This project began as a course assignment ("Build and Compare Different Agent Types") implementing five agent architectures that solve the same style of query in different ways. It has since grown into an orchestration platform: instead of the user manually choosing an architecture, a classifier analyzes the query and automatically selects the right one.

**Related docs:** [Project Tree](PROJECT_TREE.md) · [PRD](docs/PRD.md) · [High-Level Design](docs/HLD.md) · [Low-Level Design](docs/LLD.md) · [Architecture](docs/ARCHITECTURE.md) · [Frontend README](frontend/README.md)

## Table of Contents

- [Architectures](#architectures)
- [Architecture at a glance](#architecture-at-a-glance)
- [Project structure](#project-structure)
- [Setup](#setup)
- [Run each agent (CLI)](#run-each-agent-cli)
- [Run the API](#run-the-api)
- [Run the frontend](#run-the-frontend)
- [Comparison](#comparison)
- [Which agent should you use?](#which-agent-should-you-use)
- [Testing — 12 prompts](#testing--12-prompts)
- [ReAct trace](#react-trace)
- [Planning trace](#planning-trace)
- [Evaluation](#evaluation)
- [Error handling and safety](#error-handling-and-safety)
- [Video walkthrough plan](#video-walkthrough-plan)
- [Submission checklist](#submission-checklist)
- [Tests](#tests)
- [Copyright & Ownership](#copyright--ownership)

[Back to top](#top)

## Architectures

1. **Simple** — one direct LLM call.
2. **Tool-Using** — the model can select and call tools (calculator, web search).
3. **Router** — a classifier routes the query to Math, Coding, Research, or General, each with a specialized prompt.
4. **ReAct** — explicitly demonstrates Reason → Action → Observation → Answer.
5. **Planner** — creates a multi-step plan, executes it, and synthesizes the result.

The purpose is not to claim that one architecture is universally best. The goal is to make the architectural trade-offs observable and explain when each pattern is appropriate — see [Which agent should you use?](#which-agent-should-you-use).

[Back to top](#top)

## Architecture at a glance

All five agents use the same EURI LLM backend and share two tools:

- **Calculator:** safe local arithmetic evaluator implemented with Python `ast`; it does not execute arbitrary input.
- **Search:** live web search through Tavily.

The difference is **how the agent decides what to do**:

- Simple: answer immediately.
- Tool Agent: let the model decide whether to call a tool.
- Router: classify first, then dispatch to a known path.
- ReAct: repeatedly reason, act, observe, and continue.
- Planner: create a plan first, execute the planned steps, then synthesize.

An orchestrator sits in front of all five: given `mode="auto"`, it classifies the query and dispatches to the architecture it judges best; given an explicit mode, it dispatches directly (useful for demoing or comparing architectures side by side).

```text
                    USER QUERY
                        │
                        ▼
                ┌───────────────┐
                │  ORCHESTRATOR │
                └───────┬───────┘
                        │
        ┌───────┬───────┼───────┬───────┐
        ▼       ▼       ▼       ▼       ▼
     Simple   Tool    Router   ReAct  Planner
        │       │       │       │       │
        └───────┴───┬───┴───────┴───────┘
                     ▼
               TOOL REGISTRY
              (Calculator, Search)
                     │
                     ▼
                 EURI LLM
```

[Back to top](#top)

## Project structure

```text
types-of-agents-task-2/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI app: /api/run, /api/benchmark, /api/health
│   │   ├── config.py                # centralized environment configuration
│   │   ├── agents/                  # the five architectures (base.py + one file each)
│   │   ├── orchestration/           # classifier, orchestrator, execution seam
│   │   ├── tools/                   # calculator, search, tool registry
│   │   ├── llm/                     # EURI (OpenAI-compatible) client wrapper
│   │   ├── evaluation/              # benchmark harness + real latency/cost metrics
│   │   └── schemas/                 # Pydantic request/response models
│   └── tests/                       # 41 tests, no live network calls
├── cli/                              # thin standalone wrappers over backend.app.agents
├── frontend/                          # React + Vite landing page and console UI
│   └── src/{components,pages,services,hooks,data}/
├── docs/superpowers/{specs,plans}/    # design specs and implementation plans
├── run_all.py                         # runs the 12-prompt benchmark, writes test_results.json
├── pyproject.toml, uv.lock            # Python deps, managed with uv
├── .env.example
├── .gitignore
└── README.md
```

`backend/app/agents/` holds the five agent implementations as plain functions (`run(question) -> AgentResult`). `backend/app/llm/` holds the shared EURI client wrapper, and `backend/app/tools/` holds the calculator/search tools and the tool-call registry they use. `backend/app/orchestration/` classifies and dispatches a question to the right agent, `backend/app/evaluation/` runs the benchmark suite, and `backend/app/main.py` exposes it all over HTTP through FastAPI. `cli/` holds thin command-line wrappers so each agent can still be run standalone from a terminal. `frontend/` is the React landing page and console UI that talks to the API.

[Back to top](#top)

## Setup

### Backend

This project uses [uv](https://docs.astral.sh/uv/) for Python environment and dependency management.

```bash
uv sync
```

This creates `.venv` and installs exact versions from `uv.lock` automatically — no manual venv activation step needed since every command below runs through `uv run`.

Copy `.env.example` to `.env` and set:

```env
EURI_API_KEY=your_real_euri_key
EURI_MODEL=gpt-4.1-nano
EURI_BASE_URL=https://api.euron.one/api/v1/euri
TAVILY_API_KEY=your_real_tavily_key
```

No API keys are committed to this repository.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `frontend/.env` to point at the running backend (defaults to `http://localhost:8000`).

> **Windows note:** if your project path contains an `&` (as this course's default path does), `npm run <script>` may fail with `'...' is not recognized as an internal or external command` — a `cmd.exe` quirk with `&` in paths, not a project bug. Work around it with `node node_modules/vite/bin/vite.js <dev|build>` instead of `npm run dev` / `npm run build`, or move the project to a path without `&`.

[Back to top](#top)

## Run each agent (CLI)

```bash
uv run cli/simple_agent.py "What is 25 * 48?"

uv run cli/tool_agent.py "Calculate 1250 / 25 + 17."

uv run cli/router_agent.py "Write Python code for factorial using recursion."

uv run cli/react_agent.py "What is 25 * 48?"

uv run cli/planning_agent.py "Research the latest Python release and summarize three notable changes."
```

[Back to top](#top)

## Run the API

```bash
uv run uvicorn backend.app.main:app --reload --port 8000
```

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Reports whether `EURI_API_KEY`/`TAVILY_API_KEY` are configured (booleans only). |
| `/api/run` | POST | `{"query": "...", "mode": "auto\|simple\|tool\|router\|react\|planner"}` → an `AgentResult` plus `estimated_cost_usd`. |
| `/api/benchmark` | POST | Runs the 12 fixed test prompts across all five architectures and returns per-architecture metrics. |

[Back to top](#top)

## Run the frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` for the landing page, or `http://localhost:5173/console` for the interactive console (query box, Auto/manual architecture selector, live execution trace, evaluation dashboard).

[Back to top](#top)

## Comparison

| Agent Type | Best Use Case | Advantage | Limitation |
|---|---|---|---|
| **Simple** | Stable, straightforward questions | Lowest architectural complexity; fast and easy to maintain | No deterministic tools, routing, or explicit multi-step control |
| **Tool Agent** | Questions requiring calculations or external data | Model can dynamically select among multiple tools | Tool choice depends on model behavior; less explicit control than a router |
| **Router** | Systems with clearly separable domains | Predictable dispatch into specialized workflows | Classification can be wrong; rigid routes can struggle with mixed queries |
| **ReAct** | Tasks where intermediate observations change the next action | Makes iterative tool use explicit and traceable | More LLM turns increase latency, cost, and failure surface |
| **Planner** | Multi-step research, analysis, and workflows | Separates planning from execution and final synthesis | Plans can be unnecessary for simple queries and can introduce planning errors |

[Back to top](#top)

## Which agent should you use?

There is no universally best agent — choose the simplest architecture that reliably solves the task.

```text
LOW COMPLEXITY                                          HIGH COMPLEXITY
Simple  →  Tool  →  Router  →  ReAct  →  Planner
```

- *Explain RAG* → Simple
- *Calculate revenue* → Tool
- *Customer-support assistant* → Router
- *Research with iterative searches* → ReAct
- *Complex multi-step analysis* → Planner

### 1. Simple Agent

Use when the query is self-contained and does not need external data or deterministic computation. Examples: explanations, definitions, rewriting, or simple conceptual questions.

**Trade-off:** excellent simplicity, but it cannot reliably delegate arithmetic or live research to tools.

### 2. Tool-Using Agent

Use when the assistant needs access to capabilities such as calculators, search, databases, APIs, or internal business systems. The model decides which tool to invoke and receives the tool result before answering.

**Trade-off:** flexible tool selection, but the model remains responsible for choosing the correct tool.

### 3. Router Agent

Use when requests fall into known categories and each category has a specialized workflow. This project uses four routes: **Math, Coding, Research, General**.

**Trade-off:** easy to reason about operationally, but a bad classification can send a request down the wrong path.

### 4. ReAct Agent

Use when the task requires iterative interaction with tools. The architecture exposes a loop:

```text
Reason → Action → Observation → Reason → ... → Answer
```

This project prints the trace so the behavior can be demonstrated in the video.

**Trade-off:** powerful for interactive tasks, but repeated LLM calls can increase latency and cost.

### 5. Planning Agent

Use when the task has several dependent steps. The agent first produces a structured plan, then executes each step, collects intermediate results, and performs a final synthesis.

**Trade-off:** stronger workflow structure, but planning adds overhead and the plan itself can be incorrect or unnecessarily complex.

[Back to top](#top)

## Testing — 12 prompts

The harness contains 12 test prompts distributed across the five architectures. Each test records:

- **Agent selected**
- **Tool used**
- **Final output**
- **Why that agent was suitable**

Run the complete suite after adding real API keys:

```bash
uv run run_all.py
```

Results are saved to `test_results.json` (which is intentionally ignored by Git).

### Test matrix

| # | Prompt | Agent selected | Expected tool | Why suitable |
|---:|---|---|---|---|
| 1 | What is 25 * 48? | Simple | None | Baseline direct answer |
| 2 | Explain machine learning in simple terms. | Simple | None | Stable conceptual explanation |
| 3 | Calculate 1250 / 25 + 17. | Tool Agent | Calculator | Demonstrates dynamic tool selection |
| 4 | Find the latest information about AI agents. | Tool Agent | Search | Requires current external information |
| 5 | What is 19 * 37 - 12? | Router | Calculator | Clear Math route |
| 6 | Write Python code for factorial using recursion. | Router | None | Clear Coding route |
| 7 | What are the latest major developments in generative AI this week? | ReAct | Search | Shows iterative action/observation |
| 8 | Calculate 48 * 25 and explain the result. | ReAct | Calculator | Clear ReAct demonstration |
| 9 | Compare the current roles of an AI architect and an AI generalist. | Planner | Search | Multi-step comparison and synthesis |
| 10 | Research the latest Python release and summarize three notable changes. | Planner | Search | Research naturally decomposes into steps |
| 11 | Explain why tool use can improve reliability for arithmetic questions. | Planner | LLM | Multi-step explanation and synthesis |
| 12 | Find current information about the EURI API and summarize what it is used for. | Tool Agent | Search | Current external information |

### Live result format

After running the suite, paste the generated values from `test_results.json` into this section if your course requires the README to contain the exact observed outputs. A recommended format is:

| # | Agent selected | Tool used | Final output | Why suitable |
|---:|---|---|---|---|
| 1 | Simple | None | `<paste live output>` | Direct baseline |
| 2 | Simple | None | `<paste live output>` | Direct conceptual answer |
| 3 | Tool Agent | calculator | `<paste live output>` | Deterministic arithmetic |
| 4 | Tool Agent | search | `<paste live output>` | Live information |
| 5 | Router → Math | calculator | `<paste live output>` | Specialized route |
| 6 | Router → Coding | None | `<paste live output>` | Coding specialization |
| 7 | ReAct | search | `<paste live output>` | Iterative evidence gathering |
| 8 | ReAct | calculator | `<paste live output>` | Explicit tool loop |
| 9 | Planner | search | `<paste live output>` | Multi-step synthesis |
| 10 | Planner | search | `<paste live output>` | Research workflow |
| 11 | Planner | LLM | `<paste live output>` | Structured reasoning |
| 12 | Tool Agent | search | `<paste live output>` | Current information |

[Back to top](#top)

## ReAct trace

A successful ReAct run should visibly resemble:

```text
Thought: I need an exact calculation.
Action: calculator[25 * 48]
Observation: 1200
Thought: The calculation is complete.
Final Answer: 25 * 48 = 1200.
```

The actual trace is generated by the model at runtime; the example above illustrates the required architecture, not a hard-coded answer.

[Back to top](#top)

## Planning trace

A successful planning run should show:

```text
Generated plan with 3 steps
Step 1 [search]: Find current information relevant to the question. -> ...
Step 2 [llm]: Analyze the collected evidence. -> ...
Step 3 [llm]: Synthesize the final answer. -> ...
Synthesized final answer
```

The plan is generated as JSON and executed by the harness.

[Back to top](#top)

## Evaluation

`POST /api/benchmark` (and `uv run run_all.py`) run the 12 test prompts and report **real, measured** metrics per architecture: average latency, LLM call count, tool call count, and an estimated cost (derived from a rough tokens-per-call constant, clearly not billed cost — EURI's API doesn't expose real billing). **Accuracy is reported as `"Not yet measured"`** rather than a fabricated percentage — scoring real accuracy would require a labeled test set with expected answers, which doesn't exist yet.

[Back to top](#top)

## Error handling and safety

- Missing `EURI_API_KEY` raises a `ConfigurationError` (503 over the API), producing a clear message rather than a raw SDK stack trace.
- Missing `TAVILY_API_KEY` raises the same `ConfigurationError` for search.
- The calculator uses an AST whitelist instead of executing arbitrary Python with raw `eval()`.
- ReAct and Tool Agent have bounded iteration counts to prevent unbounded loops.
- A failing prompt in the benchmark is recorded as an error and does not abort the other 11.
- Secrets are excluded through `.gitignore` (`.env`, `frontend/.env`).

[Back to top](#top)

## Video walkthrough plan

The YouTube walkthrough should cover:

1. **Architecture:** explain the five agent patterns and their control flow.
2. **Simple Agent live demo:** show a direct question and one LLM call.
3. **Tool Agent live demo:** show a calculation or current-information query and the selected tool.
4. **ReAct live demo:** show the visible Reason → Action → Observation → Answer trace.
5. **Planning Agent:** show the generated plan and execution stages.
6. **Router:** explain the Math/Coding/Research/General classification and dispatch.
7. **Comparison:** explain why a simple agent is preferable for simple tasks, while ReAct/Planner architectures are useful for more complex workflows.
8. **Testing:** run `uv run run_all.py` and briefly show the generated results.

### Suggested explanation

> These five agents use the same LLM and the same underlying tools, but they differ in control strategy. The Simple Agent answers directly. The Tool Agent gives the model dynamic tool access. The Router classifies first and sends the request to a specialized path. ReAct iterates through reasoning, action, and observation. The Planner creates a workflow before execution. The right architecture depends on task complexity, required control, latency, and reliability requirements.

[Back to top](#top)

## Submission checklist

- [ ] Public GitHub repository/folder contains the project.
- [ ] README includes the required comparison table.
- [ ] At least 10 prompts are tested and documented with agent, tool, output, and rationale.
- [ ] YouTube video explains all five architectures.
- [ ] At least three agents are demonstrated live.
- [ ] Video explains where each architecture is best used.
- [ ] Video explains why one architecture can be better than another for a given task.
- [ ] No API keys are committed.

[Back to top](#top)

## Tests

```bash
uv run pytest -v
```

41 tests, all mocked against the LLM/tool layer — no live network calls in CI.

---

[Back to top](#top)

## Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

This project and its contents are original work created by **Mahesh Kumar, Founder & CEO of SaffronyxAI.in**.

Unauthorized copying, reproduction, modification, redistribution, or commercial use of this material, in whole or in part, is prohibited without prior written permission from SaffronyxAI.in.

**Author:** Mahesh Kumar
**Role:** Founder & CEO
**Company:** SaffronyxAI.in
