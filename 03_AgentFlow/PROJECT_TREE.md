# AgentFlow — Project Tree

Generated from the repository as of this commit. Excludes `.git/`, `.venv/`,
`node_modules/`, `frontend/dist/`, and Python/pytest cache directories —
those are build/dependency artifacts, not source.

```text
types-of-agents-task-2/
├── backend/
│   ├── __init__.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                      # FastAPI app: /api/run, /api/benchmark, /api/health
│   │   ├── config.py                    # centralized environment configuration
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  # AgentResult contract shared by all five
│   │   │   ├── simple.py
│   │   │   ├── tool.py
│   │   │   ├── router.py
│   │   │   ├── react.py
│   │   │   └── planner.py
│   │   ├── orchestration/
│   │   │   ├── __init__.py
│   │   │   ├── classifier.py            # LLM-based auto architecture selection
│   │   │   ├── orchestrator.py          # dispatches to the chosen architecture
│   │   │   └── execution.py             # seam for future retry/timeout/logging concerns
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   ├── calculator.py            # AST-whitelist safe arithmetic
│   │   │   ├── search.py                # Tavily web search
│   │   │   └── registry.py              # tool-calling schema + dispatch
│   │   ├── llm/
│   │   │   ├── __init__.py
│   │   │   └── euri_client.py           # EURI (OpenAI-compatible) client wrapper
│   │   ├── evaluation/
│   │   │   ├── __init__.py
│   │   │   ├── benchmark.py             # runs the 12 fixed test prompts
│   │   │   └── metrics.py               # real latency/cost metrics, no fabricated accuracy
│   │   └── schemas/
│   │       ├── __init__.py
│   │       ├── requests.py              # RunRequest
│   │       └── responses.py             # HealthResponse, RunResponse, ErrorResponse
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py                  # autouse fixture clearing API keys per test
│       ├── test_agent_base.py
│       ├── test_agents_simple.py
│       ├── test_agents_tool.py
│       ├── test_agents_router.py
│       ├── test_agents_react.py
│       ├── test_agents_planner.py
│       ├── test_classifier.py
│       ├── test_orchestrator.py
│       ├── test_metrics.py
│       ├── test_benchmark.py
│       ├── test_api.py
│       ├── test_euri_client.py
│       └── test_tools.py
│
├── cli/                                  # standalone terminal entry points
│   ├── __init__.py
│   ├── simple_agent.py
│   ├── tool_agent.py
│   ├── router_agent.py
│   ├── react_agent.py
│   └── planning_agent.py
│
├── frontend/                             # React + Vite landing page and console UI
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── ConsolePreview.jsx
│   │   │   ├── ArchitectureCard.jsx
│   │   │   ├── ArchitectureComparison.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── ToolSection.jsx
│   │   │   ├── ExecutionTrace.jsx
│   │   │   ├── EvaluationDashboard.jsx
│   │   │   ├── ArchitectureDiagram.jsx
│   │   │   ├── DemoSection.jsx
│   │   │   ├── CTASection.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   └── ConsolePage.jsx
│   │   ├── services/
│   │   │   └── api.js                   # fetch wrapper over the backend API
│   │   ├── hooks/
│   │   │   └── useAgent.js
│   │   ├── data/
│   │   │   └── architectures.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── .oxlintrc.json
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
│
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-09-09-agentflow-backend-orchestrator-design.md
│       └── plans/
│           └── 2026-09-09-agentflow-backend-orchestrator.md
│
├── run_all.py                            # runs the benchmark, writes test_results.json
├── pyproject.toml                        # Python project + dependencies (uv-managed)
├── uv.lock
├── .env.example
├── .gitignore
├── PROJECT_TREE.md                       # this file
└── README.md
```

## Not yet present

Deferred pieces of the target architecture that don't exist yet:

- `docs/{PRD,HLD,LLD,ARCHITECTURE}.md` — product/design docs beyond the README and the specs/plans under `docs/superpowers/`.
- `screenshots/` — no screenshots captured yet.
- `docker-compose.yml` — no containerization yet; both apps run directly via `uv`/`npm`.
- `LICENSE` — intentionally not added. Per project direction, this is proprietary, all-rights-reserved work, not open source; a license file will only be added if a specific proprietary license text is requested.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
