"""Tests for the ReAct agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

from backend.app.agents import react


@patch("backend.app.agents.react.calculator")
@patch("backend.app.agents.react.chat")
def test_react_agent_uses_calculator_then_answers(mock_chat, mock_calculator):
    mock_chat.side_effect = [
        "Thought: I need to calculate this.\nAction: calculator[25 * 48]",
        "Thought: I have the result.\nFinal Answer: 25 * 48 = 1200.",
    ]
    mock_calculator.return_value = "1200"

    result = react.run("What is 25 * 48?")

    assert result["architecture"] == "ReAct"
    assert result["answer"] == "25 * 48 = 1200."
    assert result["tools_used"] == ["calculator"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 2
    assert len(result["steps"]) == 3  # first response, observation, second response


@patch("backend.app.agents.react.chat")
def test_react_agent_raises_after_max_iterations_without_final_answer(mock_chat):
    mock_chat.return_value = "Thought: still thinking.\nAction: calculator[1 + 1]"

    with patch("backend.app.agents.react.calculator", return_value="2"):
        try:
            react.run("Never finishes.", max_iterations=2)
            assert False, "expected RuntimeError"
        except RuntimeError as exc:
            assert "did not produce a Final Answer" in str(exc)
