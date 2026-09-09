"""Tests for the Planning agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import json
from unittest.mock import patch

from backend.app.agents import planner


@patch("backend.app.agents.planner.search")
@patch("backend.app.agents.planner.chat")
def test_planner_executes_plan_and_synthesizes(mock_chat, mock_search):
    plan = {
        "steps": [
            {"description": "Research topic", "tool": "search"},
            {"description": "Summarize findings", "tool": "llm"},
        ]
    }
    mock_chat.side_effect = [
        json.dumps(plan),
        "Summary of findings.",
        "Final synthesized answer.",
    ]
    mock_search.return_value = "search evidence"

    result = planner.run("Research X and summarize it.")

    assert result["architecture"] == "Planner"
    assert result["answer"] == "Final synthesized answer."
    assert result["tools_used"] == ["search"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 3  # plan + llm step + final synthesis
    assert result["steps"][0] == "Generated plan with 2 steps"
    assert result["steps"][-1] == "Synthesized final answer"


@patch("backend.app.agents.planner.chat")
def test_planner_raises_on_invalid_plan_json(mock_chat):
    mock_chat.return_value = "not valid json"

    try:
        planner.run("Anything")
        assert False, "expected RuntimeError"
    except RuntimeError as exc:
        assert "invalid JSON" in str(exc)
