"""LLM-based classifier choosing which agent architecture should handle a query.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import json

from backend.app.llm.euri_client import chat

VALID_ARCHITECTURES = {"Simple", "Tool", "Router", "ReAct", "Planner"}

CLASSIFIER_SYSTEM = """Choose the single best agent architecture for the user's query. Return JSON only: {"architecture": "Simple|Tool|Router|ReAct|Planner"}.

Guidance (low to high complexity):
- Simple: direct conceptual questions needing no tools or external data.
- Tool: needs one calculation or one piece of current information.
- Router: fits cleanly into a known domain (math, coding, research, general) and benefits from a specialized prompt.
- ReAct: needs iterative reasoning where later actions depend on earlier tool observations.
- Planner: multi-step tasks needing a plan, several pieces of evidence, and a synthesis step."""


def classify(question: str) -> str:
    raw = chat(
        [
            {"role": "system", "content": CLASSIFIER_SYSTEM},
            {"role": "user", "content": question},
        ],
        temperature=0,
    )
    try:
        architecture = json.loads(raw).get("architecture", "Simple")
    except json.JSONDecodeError:
        architecture = raw.strip().split()[0].strip("`.,:")
    return architecture if architecture in VALID_ARCHITECTURES else "Simple"
