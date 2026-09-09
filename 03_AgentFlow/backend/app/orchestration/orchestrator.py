"""Dispatches a question to an agent architecture, auto-classifying or using the caller's choice.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from backend.app.agents import planner, react, router, simple, tool
from backend.app.agents.base import AgentResult
from backend.app.orchestration.classifier import classify
from backend.app.orchestration.execution import execute

_ARCHITECTURE_TO_MODE = {
    "Simple": "simple",
    "Tool": "tool",
    "Router": "router",
    "ReAct": "react",
    "Planner": "planner",
}


def run(question: str, mode: str = "auto") -> AgentResult:
    # Look up agent modules via globals() (not a module-load-time dict) so tests
    # can patch e.g. orchestrator.simple and have dispatch honor the mock.
    agents = {
        "simple": simple,
        "tool": tool,
        "router": router,
        "react": react,
        "planner": planner,
    }

    mode = mode.lower()
    if mode == "auto":
        architecture = classify(question)
        mode = _ARCHITECTURE_TO_MODE[architecture]
    if mode not in agents:
        raise ValueError(f"Unknown mode: {mode}")
    return execute(agents[mode], question)
