"""Shared result contract every AgentFlow agent returns.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from typing import Optional, TypedDict


class AgentResult(TypedDict):
    architecture: str
    answer: str
    steps: list[str]
    tools_used: list[str]
    llm_calls: int
    tool_calls: int
    latency_ms: int
    route: Optional[str]


def make_result(
    *,
    architecture: str,
    answer: str,
    steps: list[str],
    tools_used: list[str],
    llm_calls: int,
    tool_calls: int,
    latency_ms: int,
    route: Optional[str] = None,
) -> AgentResult:
    return AgentResult(
        architecture=architecture,
        answer=answer,
        steps=steps,
        tools_used=tools_used,
        llm_calls=llm_calls,
        tool_calls=tool_calls,
        latency_ms=latency_ms,
        route=route,
    )
