"""Tests for the Tool-Using agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import json
from unittest.mock import MagicMock, patch

from backend.app.agents import tool


def _tool_call(name: str, arguments: dict, call_id: str = "call_1"):
    call = MagicMock()
    call.id = call_id
    call.function.name = name
    call.function.arguments = json.dumps(arguments)
    return call


@patch("backend.app.agents.tool.execute_tool")
@patch("backend.app.agents.tool.get_client")
def test_tool_agent_calls_calculator_then_answers(mock_get_client, mock_execute_tool):
    mock_execute_tool.return_value = "1200"
    mock_client = MagicMock()

    first_response = MagicMock()
    first_response.choices = [MagicMock(message=MagicMock(tool_calls=[_tool_call("calculator", {"expression": "25 * 48"})]))]

    second_response = MagicMock()
    second_message = MagicMock(tool_calls=None, content="25 * 48 = 1200.")
    second_response.choices = [MagicMock(message=second_message)]

    mock_client.chat.completions.create.side_effect = [first_response, second_response]
    mock_get_client.return_value = mock_client

    result = tool.run("Calculate 25 * 48")

    assert result["architecture"] == "Tool Agent"
    assert result["answer"] == "25 * 48 = 1200."
    assert result["tools_used"] == ["calculator"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 2
    assert result["steps"] == ["Called calculator({'expression': '25 * 48'})", "Synthesized final answer"]


@patch("backend.app.agents.tool.get_client")
def test_tool_agent_answers_directly_without_tools(mock_get_client):
    mock_client = MagicMock()
    response = MagicMock()
    response.choices = [MagicMock(message=MagicMock(tool_calls=None, content="Direct answer."))]
    mock_client.chat.completions.create.return_value = response
    mock_get_client.return_value = mock_client

    result = tool.run("Explain machine learning.")

    assert result["tools_used"] == []
    assert result["llm_calls"] == 1
    assert result["steps"] == ["Answered directly without tools"]
