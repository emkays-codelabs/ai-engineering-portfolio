<a id="top"></a>

# AgentFlow

**Multi-Architecture AI Agent Orchestration Platform**

> The right agent architecture for every task.

![Maintained by](https://img.shields.io/badge/maintained%20by-Mahesh%20Kumar-blue)
![Company](https://img.shields.io/badge/company-SaffronyxAI.in-orange)
![Backend](https://img.shields.io/badge/backend-FastAPI%20%7C%20Python%203.10%2B-009688)
![Frontend](https://img.shields.io/badge/frontend-React%2019%20%7C%20Vite-646cff)
![Tests](https://img.shields.io/badge/tests-41%20passing-brightgreen)
![Docker](https://img.shields.io/badge/docker-compose%20ready-2496ED)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

Most agent demos pick one execution strategy — direct answers, tool calls, iterative reasoning — and stop there. AgentFlow implements five of them side by side behind a single interface, lets an LLM classifier pick the right one automatically, and shows exactly how it got the answer: which architecture ran, which tools it called, and how long it took.

The interesting problem isn't building one more agent — it's deciding, per query, which agent should even run. AgentFlow's orchestrator makes that decision automatically and exposes the reasoning behind it, instead of asking the user to pick an architecture up front.

**Related docs:** [PRD](docs/PRD.md) · [High-Level Design](docs/HLD.md) · [Low-Level Design](docs/LLD.md) · [Architecture](docs/ARCHITECTURE.md) · [Frontend README](frontend/README.md)

## Quick start — four ways to run this

| Goal | Command | Details |
|---|---|---|
| Run one architecture from a terminal | `uv run cli/simple_agent.py "What is 25 * 48?"` | [§5](#5-run-each-agent-cli) |
| Run the full HTTP API | `uv run uvicorn backend.app.main:app --reload --port 8000` | [§6](#6-run-the-api) |
| Use the interactive web console | `cd frontend && npm install && npm run dev` | [§7](#7-run-the-frontend) |
| Run backend + frontend as containers | `docker compose up --build` | [§4.3](#43-docker-optional) |

All four call into the same `backend/app/agents/*.run(question)` functions underneath — no logic is duplicated between the CLI, the API, and the frontend. Each option needs `.env` set up first — see [§4, Setup](#4-setup).

## Table of Contents

1. [Architectures](#1-architectures)
2. [Architecture at a glance](#2-architecture-at-a-glance)
3. [Project structure](#3-project-structure)
4. [Setup](#4-setup)
5. [Run each agent (CLI)](#5-run-each-agent-cli)
6. [Run the API](#6-run-the-api)
7. [Run the frontend](#7-run-the-frontend)
8. [Comparison](#8-comparison)
9. [Which agent should you use?](#9-which-agent-should-you-use)
10. [Testing — 12 prompts](#10-testing--12-prompts)
11. [ReAct trace](#11-react-trace)
12. [Planning trace](#12-planning-trace)
13. [Evaluation](#13-evaluation)
14. [Error handling and safety](#14-error-handling-and-safety)
15. [System walkthrough](#15-system-walkthrough)
16. [Tests](#16-tests)
17. [Copyright & Ownership](#17-copyright--ownership)

[Back to top](#top)

## 1. Architectures

1. **Simple** — one direct LLM call.
2. **Tool-Using** — the model can select and call tools (calculator, web search).
3. **Router** — a classifier routes the query to Math, Coding, Research, or General, each with a specialized prompt.
4. **ReAct** — explicitly demonstrates Reason → Action → Observation → Answer.
5. **Planner** — creates a multi-step plan, executes it, and synthesizes the result.

The point isn't to crown one architecture "best." It's to make the trade-offs between them observable, and to say plainly when each pattern earns its complexity — see [§9, Which agent should you use?](#9-which-agent-should-you-use).

[Back to top](#top)

## 2. Architecture at a glance

All five agents share the same EURI LLM backend and the same two tools:

- **Calculator:** safe local arithmetic evaluator implemented with Python `ast`; it does not execute arbitrary input.
- **Search:** live web search through Tavily.

What differs is **how each agent decides what to do**:

- Simple: answer immediately.
- Tool Agent: let the model decide whether to call a tool.
- Router: classify first, then dispatch to a known path.
- ReAct: repeatedly reason, act, observe, and continue.
- Planner: create a plan first, execute the planned steps, then synthesize.

An orchestrator sits in front of all five: given `mode="auto"`, it classifies the query and dispatches to the architecture it judges best; given an explicit mode, it dispatches directly — useful for demoing or comparing architectures side by side.

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

## 3. Project structure

```text
agentflow/
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
│   ├── tests/                        # 41 tests, no live network calls
│   └── Dockerfile                    # backend container (uv + Uvicorn)
├── cli/                              # thin standalone wrappers over backend.app.agents
├── frontend/                          # React + Vite landing page and console UI
│   ├── src/{components,pages,services,hooks,data}/
│   ├── Dockerfile                    # multi-stage: Node build -> nginx serve
│   └── nginx.conf                    # SPA fallback so client-side routes survive a refresh
├── docs/{PRD,HLD,LLD,ARCHITECTURE}.md, docs/superpowers/{specs,plans}/
├── run_all.py                         # runs the 12-prompt benchmark, writes test_results.json
├── docker-compose.yml                 # wires backend (:8000) + frontend (:8080) together
├── pyproject.toml, uv.lock            # Python deps, managed with uv
├── .env.example
├── .gitignore, .dockerignore
└── README.md
```

`backend/app/agents/` holds the five agent implementations as plain functions (`run(question) -> AgentResult`). `backend/app/llm/` holds the shared EURI client wrapper, and `backend/app/tools/` holds the calculator/search tools and the tool-call registry they use. `backend/app/orchestration/` classifies and dispatches a question to the right agent, `backend/app/evaluation/` runs the benchmark suite, and `backend/app/main.py` exposes it all over HTTP through FastAPI. `cli/` holds thin command-line wrappers so each agent can still be run standalone from a terminal. `frontend/` is the React landing page and console UI that talks to the API. Both `backend/` and `frontend/` also ship a `Dockerfile` so either can run as a container — see [§4.3](#43-docker-optional).

[Back to top](#top)

## 4. Setup

### 4.1 Backend

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

### 4.2 Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `frontend/.env` to point at the running backend (defaults to `http://localhost:8000`).

> **Windows note:** if your project path contains an `&`, `npm run <script>` may fail with `'...' is not recognized as an internal or external command` — a `cmd.exe` quirk with `&` in paths, not a project bug. Work around it with `node node_modules/vite/bin/vite.js <dev|build>` instead of `npm run dev` / `npm run build`, or move the project to a path without `&`.

### 4.3 Docker (optional)

Both services also run as containers — the frontend build is multi-stage (Node → static bundle served by nginx, never the Vite dev server), and no API key ever reaches either image; they're injected at container runtime.

```bash
cp .env.example .env   # fill in your real EURI_API_KEY / TAVILY_API_KEY
docker compose up --build
```

Frontend: `http://localhost:8080` · Backend: `http://localhost:8000`. This is an alternative to the `uv run` / `npm run dev` flow above, not a replacement for it — local development doesn't require Docker.

[Back to top](#top)

## 5. Run each agent (CLI)

```bash
uv run cli/simple_agent.py "What is 25 * 48?"

uv run cli/tool_agent.py "Calculate 1250 / 25 + 17."

uv run cli/router_agent.py "Write Python code for factorial using recursion."

uv run cli/react_agent.py "What is 25 * 48?"

uv run cli/planning_agent.py "Research the latest Python release and summarize three notable changes."
```

[Back to top](#top)

## 6. Run the API

```bash
uv run uvicorn backend.app.main:app --reload --port 8000
```

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Reports whether `EURI_API_KEY`/`TAVILY_API_KEY` are configured (booleans only). |
| `/api/run` | POST | `{"query": "...", "mode": "auto\|simple\|tool\|router\|react\|planner"}` → an `AgentResult` plus `estimated_cost_usd`. |
| `/api/benchmark` | POST | Runs the 12 fixed test prompts across all five architectures and returns per-architecture metrics. |

[Back to top](#top)

## 7. Run the frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` for the landing page, or `http://localhost:5173/console` for the interactive console (query box, Auto/manual architecture selector, live execution trace, evaluation dashboard).

[Back to top](#top)

## 8. Comparison

| Agent Type | Best Use Case | Advantage | Limitation |
|---|---|---|---|
| **Simple** | Stable, straightforward questions | Lowest architectural complexity; fast and easy to maintain | No deterministic tools, routing, or explicit multi-step control |
| **Tool Agent** | Questions requiring calculations or external data | Model can dynamically select among multiple tools | Tool choice depends on model behavior; less explicit control than a router |
| **Router** | Systems with clearly separable domains | Predictable dispatch into specialized workflows | Classification can be wrong; rigid routes can struggle with mixed queries |
| **ReAct** | Tasks where intermediate observations change the next action | Makes iterative tool use explicit and traceable | More LLM turns increase latency, cost, and failure surface |
| **Planner** | Multi-step research, analysis, and workflows | Separates planning from execution and final synthesis | Plans can be unnecessary for simple queries and can introduce planning errors |

[Back to top](#top)

## 9. Which agent should you use?

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

### 9.1 Simple Agent

Use when the query is self-contained and does not need external data or deterministic computation. Examples: explanations, definitions, rewriting, or simple conceptual questions.

**Trade-off:** excellent simplicity, but it cannot reliably delegate arithmetic or live research to tools.

### 9.2 Tool-Using Agent

Use when the assistant needs access to capabilities such as calculators, search, databases, APIs, or internal business systems. The model decides which tool to invoke and receives the tool result before answering.

**Trade-off:** flexible tool selection, but the model remains responsible for choosing the correct tool.

### 9.3 Router Agent

Use when requests fall into known categories and each category has a specialized workflow. This project uses four routes: **Math, Coding, Research, General**.

**Trade-off:** easy to reason about operationally, but a bad classification can send a request down the wrong path.

### 9.4 ReAct Agent

Use when the task requires iterative interaction with tools. The architecture exposes a loop:

```text
Reason → Action → Observation → Reason → ... → Answer
```

This project prints the trace so the reasoning is visible, not just the final answer.

**Trade-off:** powerful for interactive tasks, but repeated LLM calls can increase latency and cost.

### 9.5 Planning Agent

Use when the task has several dependent steps. The agent first produces a structured plan, then executes each step, collects intermediate results, and performs a final synthesis.

**Trade-off:** stronger workflow structure, but planning adds overhead and the plan itself can be incorrect or unnecessarily complex.

[Back to top](#top)

## 10. Testing — 12 prompts

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

### 10.1 Test matrix

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

### 10.2 Live result format

After running the suite, paste the generated values from `test_results.json` into this section for a fully reproducible record of observed output. A recommended format is:

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

## 11. ReAct trace

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

## 12. Planning trace

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

## 13. Evaluation

`POST /api/benchmark` (and `uv run run_all.py`) run the 12 test prompts and report **real, measured** metrics per architecture: average latency, LLM call count, tool call count, and an estimated cost (derived from a rough tokens-per-call constant, clearly not billed cost — EURI's API doesn't expose real billing). **Accuracy is reported as `"Not yet measured"`** rather than a fabricated percentage — scoring real accuracy would require a labeled test set with expected answers, which doesn't exist yet.

[Back to top](#top)

## 14. Error handling and safety

- Missing `EURI_API_KEY` raises a `ConfigurationError` (503 over the API), producing a clear message rather than a raw SDK stack trace.
- Missing `TAVILY_API_KEY` raises the same `ConfigurationError` for search.
- The calculator uses an AST whitelist instead of executing arbitrary Python with raw `eval()`.
- ReAct and Tool Agent have bounded iteration counts to prevent unbounded loops.
- A failing prompt in the benchmark is recorded as an error and does not abort the other 11.
- Secrets are excluded through `.gitignore` (`.env`, `frontend/.env`).

[Back to top](#top)

## 15. System walkthrough

What to look at, per architecture, to see the control flow in action:

1. **Architecture overview:** the five agent patterns and how they differ in control flow — see [§1](#1-architectures) and [§2](#2-architecture-at-a-glance).
2. **Simple Agent:** a direct question, answered in one LLM call.
3. **Tool Agent:** a calculation or current-information query, showing dynamic tool selection.
4. **ReAct:** the visible Reason → Action → Observation → Answer loop — see [§11](#11-react-trace).
5. **Planning Agent:** a generated plan, its execution, and the final synthesis — see [§12](#12-planning-trace).
6. **Router:** the Math/Coding/Research/General classification and dispatch.
7. **Comparison:** why a simple agent suits simple tasks while ReAct/Planner earn their overhead on complex ones — see [§9](#9-which-agent-should-you-use).
8. **Evaluation:** `uv run run_all.py` against the 12-prompt suite, with the resulting metrics — see [§13](#13-evaluation).

### 15.1 One-paragraph pitch

> These five agents share the same LLM and the same tools, but differ in control strategy. Simple answers directly. Tool gives the model dynamic tool access. Router classifies first and dispatches to a specialized path. ReAct iterates through reasoning, action, and observation. Planner builds a workflow before executing it. The right architecture depends on task complexity, the control you need over execution, and your latency/reliability budget.

[Back to top](#top)

## 16. Tests

```bash
uv run pytest -v
```

41 tests, all mocked against the LLM/tool layer — no live network calls in CI.

---

[Back to top](#top)

## 17. Copyright & Ownership

© 2026 SaffronyxAI.in. All Rights Reserved.

This project and its contents are original work created by **Mahesh Kumar, Founder & CEO of SaffronyxAI.in**.

Unauthorized copying, reproduction, modification, redistribution, or commercial use of this material, in whole or in part, is prohibited without prior written permission from SaffronyxAI.in.

**Author:** Mahesh Kumar
**Role:** Founder & CEO
**Company:** SaffronyxAI.in
