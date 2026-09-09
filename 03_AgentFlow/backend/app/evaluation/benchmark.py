"""Runs the fixed 12-prompt test set across all five architectures.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from backend.app.evaluation.metrics import aggregate, estimate_cost_usd
from backend.app.orchestration.orchestrator import run as orchestrator_run

TEST_PROMPTS = [
    {"id": 1, "prompt": "What is 25 * 48?", "mode": "simple"},
    {"id": 2, "prompt": "Explain machine learning in simple terms.", "mode": "simple"},
    {"id": 3, "prompt": "Calculate 1250 / 25 + 17.", "mode": "tool"},
    {"id": 4, "prompt": "Find the latest information about AI agents.", "mode": "tool"},
    {"id": 5, "prompt": "What is 19 * 37 - 12?", "mode": "router"},
    {"id": 6, "prompt": "Write Python code for factorial using recursion.", "mode": "router"},
    {"id": 7, "prompt": "What are the latest major developments in generative AI this week?", "mode": "react"},
    {"id": 8, "prompt": "Calculate 48 * 25 and explain the result.", "mode": "react"},
    {"id": 9, "prompt": "Compare the current roles of an AI architect and an AI generalist.", "mode": "planner"},
    {"id": 10, "prompt": "Research the latest Python release and summarize three notable changes.", "mode": "planner"},
    {"id": 11, "prompt": "Explain why tool use can improve reliability for arithmetic questions.", "mode": "planner"},
    {"id": 12, "prompt": "Find current information about the EURI API and summarize what it is used for.", "mode": "tool"},
]


def run_benchmark() -> dict:
    results = []
    errors = []
    for test in TEST_PROMPTS:
        try:
            result = orchestrator_run(test["prompt"], mode=test["mode"])
            results.append({**test, "result": result, "estimated_cost_usd": estimate_cost_usd(result["llm_calls"])})
        except Exception as exc:
            errors.append({**test, "error": str(exc)})

    by_architecture: dict[str, list] = {}
    for entry in results:
        by_architecture.setdefault(entry["result"]["architecture"], []).append(entry["result"])

    return {
        "results": results,
        "errors": errors,
        "aggregate_by_architecture": {name: aggregate(items) for name, items in by_architecture.items()},
        "accuracy": "Not yet measured",
    }
