# CLAUDE.md — AgentFlow

Project context for Claude Code. Read this first when opening a session here.

## What this is

**AgentFlow** — a multi-architecture AI agent orchestration platform. Started as a course assignment ("Build and Compare Different Agent Types") implementing five agent architectures (Simple, Tool-Using, Router, ReAct, Planner); evolved into a product where an LLM classifier auto-selects the right architecture per query instead of the user choosing manually.

Full details: [README.md](README.md) (start here), [PROJECT_TREE.md](PROJECT_TREE.md), [docs/PRD.md](docs/PRD.md), [docs/HLD.md](docs/HLD.md), [docs/LLD.md](docs/LLD.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Current state (as of this writing)

- **Backend**: complete and tested. `backend/app/{agents,orchestration,tools,llm,evaluation,schemas}/`, FastAPI app at `backend/app/main.py`. 41 tests in `backend/tests/`, all passing, no live network calls.
- **Frontend**: functional scaffold, not yet visually polished. `frontend/` — Vite + React, `/` (landing) and `/console` (working query interface) routes. Builds clean (`npm run build` / `node node_modules/vite/bin/vite.js build`).
- **CLI**: `cli/*.py` — standalone terminal demos of each architecture, unaffected by frontend/API state.
- **Not yet built**: Docker Compose, `LICENSE` (intentionally omitted — proprietary work, not open source), screenshots, visual design pass on the frontend.

## Key facts to not re-derive

- **Package manager**: `uv` for Python (not pip/requirements.txt — this was migrated deliberately). `npm` for the frontend.
- **LLM backend**: EURI API (euron.one), OpenAI-SDK-compatible, via `backend/app/llm/euri_client.py`. Real API keys live in `.env` (gitignored, never commit). `EURI_API_KEY` and `TAVILY_API_KEY` are both configured and working in this local environment as of the last session.
- **Honesty constraint (do not violate)**: evaluation metrics must be real, measured values (latency, LLM calls, tool calls, cost estimate). Accuracy must always read `"Not yet measured"` — never fabricate a percentage. This was an explicit, repeated user requirement.
- **Branding**: "AgentFlow" / "Multi-Architecture AI Agent Orchestration Platform" / tagline "The right agent architecture for every task." Do not refer to the project by its original assignment name in user-facing copy.
- **Authorship/copyright standard** (applies repo-wide, already applied to all original source/docs): Author Mahesh Kumar, Founder & CEO of SaffronyxAI.in, © 2026 SaffronyxAI.in. All Rights Reserved. Short header on source files, full "Copyright & Ownership" section in README/docs, short footer on PROJECT_TREE.md. Never add an open-source license (MIT/Apache/GPL/etc.) — this is proprietary work.
- **This folder was moved** from `C:\00_AI_Architect\32._W&L\TypesofAgents_Projects\` to its current location. `.venv` was rebuilt after the move (venv launcher scripts hardcode absolute paths and break on a folder move — if anything Python-related throws a "trampoline failed to canonicalize" error again after another move, `rm -rf .venv && uv sync` fixes it). `frontend/node_modules` survived the move fine (JS tooling doesn't bake in absolute paths the same way).
- **Public repo**: this project is also pushed to `https://github.com/emkays-codelabs/ai-engineering-portfolio` under `03_AgentFlow/`, as one entry in a multi-project portfolio repo (see that repo's root `Readme.md` for the pattern other projects there follow). That push was done via `git archive HEAD` (tracked files only, so `.env`/`node_modules`/caches were never at risk of leaking) — if pushing an update there again, repeat that pattern rather than copying the whole working tree.
- **Windows path gotcha**: this project's original path contained `&` (in `32._W&L`), which broke `npm run <script>` via `cmd.exe`'s batch-file wrappers. The workaround (`node node_modules/vite/bin/vite.js <dev|build>` instead of `npm run dev`/`build`) is documented in both READMEs. The new path doesn't have this character, but the workaround is harmless either way.

## Running things

```bash
uv sync                                              # backend deps
uv run pytest -v                                     # 41 tests
uv run uvicorn backend.app.main:app --reload --port 8000   # API
uv run cli/simple_agent.py "question"                # any of the 5 CLI wrappers
uv run run_all.py                                    # 12-prompt benchmark, writes test_results.json

cd frontend && npm install && npm run dev            # frontend dev server, localhost:5173
```

## Working conventions established in this project

- TDD via the `superpowers` skill set: brainstorming → spec → plan → subagent-driven implementation → code review → merge, for anything beyond a small fix.
- Git worktrees (`.worktrees/`, gitignored) used for isolating larger feature branches from `master`.
- Commits end with `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
