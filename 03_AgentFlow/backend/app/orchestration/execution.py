"""Execution seam between the orchestrator and an individual agent module.

Kept separate from orchestrator.py (which only decides *which* architecture to
run) so that cross-cutting execution concerns — retries, timeouts, logging —
have a single place to live later without every agent needing to know about
them. Currently a thin passthrough; there is nothing to add until one of
those concerns is actually needed (YAGNI).

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from typing import Protocol

from backend.app.agents.base import AgentResult


class RunnableAgent(Protocol):
    def run(self, question: str) -> AgentResult: ...


def execute(agent: RunnableAgent, question: str) -> AgentResult:
    """Run one agent module against a question and return its AgentResult."""
    return agent.run(question)
