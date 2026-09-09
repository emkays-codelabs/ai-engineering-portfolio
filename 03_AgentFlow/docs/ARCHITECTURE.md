# AgentFlow — Architecture

One-page summary. For requirements see [PRD.md](PRD.md); for component detail see [HLD.md](HLD.md) and [LLD.md](LLD.md).

## The five architectures

```text
Simple      Query → LLM → Answer
Tool        Query → LLM → Tool → Observation → Answer
Router      Query → Classify → Specialized Path → Answer
ReAct       Reason → Action → Observation → Reason → ... → Answer
Planner     Query → Plan → Execute Steps → Synthesize → Answer
```

There is no universally best architecture — the right choice depends on task complexity, need for external data, and how much iterative reasoning the task requires:

```text
LOW COMPLEXITY                                          HIGH COMPLEXITY
Simple  →  Tool  →  Router  →  ReAct  →  Planner
```

## The orchestrator turns five demos into one product

Rather than the user picking an architecture, `backend/app/orchestration/classifier.py` classifies the query and `orchestrator.py` dispatches automatically (`mode="auto"`). Manual mode selection remains available for direct comparison and for the video demo.

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

## Three interfaces, one backend

- **CLI** (`cli/`) — direct terminal access to a single architecture, for scripted or live demos.
- **API** (`backend/app/main.py`) — `POST /api/run` (auto or manual), `POST /api/benchmark` (real metrics), `GET /api/health`.
- **Web console** (`frontend/`) — the same `/api/run` call, with a live execution trace rendered from the `AgentResult.steps` field.

All three ultimately call the same `backend/app/agents/*.run(question)` functions — no logic is duplicated between them.

## Honesty as a design constraint

Two explicit rules run through the whole system:

1. **Never fabricate a metric.** `backend/app/evaluation/metrics.py` computes real latency, LLM-call, and tool-call counts from actual runs; the cost figure is clearly labeled an estimate; accuracy is `"Not yet measured"` until a labeled test set exists.
2. **Never swallow a configuration error.** A missing `EURI_API_KEY` or `TAVILY_API_KEY` raises a distinct `ConfigurationError`, surfaced as HTTP 503 (not a generic 500 or a silent failure), across every entry point (CLI, API, benchmark).

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
