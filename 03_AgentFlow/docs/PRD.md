# AgentFlow — Product Requirements Document

## Problem

Building an AI agent means choosing an execution strategy — answer directly, call tools, classify-and-route, reason iteratively, or plan ahead — and that choice has real trade-offs in latency, cost, and reliability. Most demos pick one strategy and stop there, leaving the trade-offs invisible.

## Product

AgentFlow is an AI agent orchestration platform that implements five execution strategies (Simple, Tool-Using, Router, ReAct, Planner) behind a single interface, automatically selects the right one for a given query, and exposes the execution trace and real performance metrics so the trade-offs are observable rather than asserted.

## Goals

- Let a user (or the frontend console) submit one query and get an answer without knowing which architecture handled it (`mode="auto"`).
- Let a user force a specific architecture to compare behavior directly (`mode="simple"|"tool"|"router"|"react"|"planner"`).
- Make execution observable: every response includes a step-by-step trace, tool calls, LLM call count, and latency.
- Measure architectures honestly: report real latency/cost/call-count metrics from actual runs; never fabricate an accuracy number without a labeled test set.

## Non-Goals (current phase)

- Real accuracy scoring (needs a labeled test set with expected answers — not built yet).
- Persistence, conversation history, authentication, multi-tenant usage.
- Streaming/live step-by-step delivery over the API (the MVP returns one complete response per run).
- Additional tools beyond calculator and web search.

## Users

- The end user submitting a query through the console UI.
- The project author, using the CLI wrappers and benchmark harness to demo and evaluate the five architectures for the course submission and portfolio.

## Requirements

| # | Requirement | Status |
|---|---|---|
| 1 | Five independently correct agent architectures, each returning a uniform result shape | Done — `backend/app/agents/` |
| 2 | Automatic architecture selection via an LLM classifier | Done — `backend/app/orchestration/classifier.py` |
| 3 | Manual architecture override | Done — `orchestrator.run(question, mode=...)` |
| 4 | HTTP API exposing run/benchmark/health | Done — `backend/app/main.py` |
| 5 | Real, non-fabricated evaluation metrics | Done — `backend/app/evaluation/` |
| 6 | Web UI: landing page explaining the platform + a working console | Scaffolded — `frontend/` (functional, not yet visually polished) |
| 7 | CLI entry points for standalone/video demo use | Done — `cli/` |
| 8 | 12+ test prompts documented with rationale | Done — see README's Testing section |
| 9 | Video walkthrough explaining all five architectures | Pending (user-recorded) |

## Success Criteria

- All 41 backend tests pass with zero live network calls.
- Each of the five architectures can be demoed live via the CLI and the console.
- The comparison table and test matrix in the README accurately describe observed behavior.
- No API keys are committed to the repository.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
