"""Tests for the Simple agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

from backend.app.agents import simple


@patch("backend.app.agents.simple.chat")
def test_simple_agent_returns_uniform_result(mock_chat):
    mock_chat.return_value = "25 * 48 = 1200."

    result = simple.run("What is 25 * 48?")

    assert result["architecture"] == "Simple"
    assert result["answer"] == "25 * 48 = 1200."
    assert result["steps"] == ["Answered directly"]
    assert result["tools_used"] == []
    assert result["llm_calls"] == 1
    assert result["tool_calls"] == 0
    assert result["latency_ms"] >= 0
    mock_chat.assert_called_once()
