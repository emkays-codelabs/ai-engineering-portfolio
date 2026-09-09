"""Tests for the shared AgentResult contract.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from backend.app.agents.base import AgentResult, make_result


def test_make_result_has_all_required_keys():
    result: AgentResult = make_result(
        architecture="Simple",
        answer="42",
        steps=["Answered directly"],
        tools_used=[],
        llm_calls=1,
        tool_calls=0,
        latency_ms=120,
    )
    assert result == {
        "architecture": "Simple",
        "answer": "42",
        "steps": ["Answered directly"],
        "tools_used": [],
        "llm_calls": 1,
        "tool_calls": 0,
        "latency_ms": 120,
        "route": None,
    }


def test_make_result_accepts_route():
    result = make_result(
        architecture="Router",
        answer="answer",
        steps=["Classified as Math"],
        tools_used=["calculator"],
        llm_calls=3,
        tool_calls=1,
        latency_ms=200,
        route="Math",
    )
    assert result["route"] == "Math"
