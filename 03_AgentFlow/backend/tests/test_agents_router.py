"""Tests for the Router agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

from backend.app.agents import router


@patch("backend.app.agents.router.calculator")
@patch("backend.app.agents.router.chat")
def test_router_math_route(mock_chat, mock_calculator):
    mock_chat.side_effect = [
        '{"route": "Math"}',
        "19 * 37 - 12",
        "The answer is 691.",
    ]
    mock_calculator.return_value = "691"

    result = router.run("What is 19 * 37 - 12?")

    assert result["architecture"] == "Router"
    assert result["route"] == "Math"
    assert result["tools_used"] == ["calculator"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 3
    assert result["answer"] == "The answer is 691."


@patch("backend.app.agents.router.chat")
def test_router_coding_route(mock_chat):
    mock_chat.side_effect = [
        '{"route": "Coding"}',
        "def factorial(n): return 1 if n <= 1 else n * factorial(n - 1)",
    ]

    result = router.run("Write Python code for factorial using recursion.")

    assert result["route"] == "Coding"
    assert result["tools_used"] == []
    assert result["tool_calls"] == 0
    assert result["llm_calls"] == 2


@patch("backend.app.agents.router.chat")
def test_router_falls_back_to_general_on_malformed_json(mock_chat):
    mock_chat.side_effect = ["not json", "A general answer."]

    result = router.run("Tell me something interesting.")

    assert result["route"] == "General"
