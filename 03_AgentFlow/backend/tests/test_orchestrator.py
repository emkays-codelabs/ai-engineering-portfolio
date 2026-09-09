"""Tests for the orchestrator's dispatch logic.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

import pytest

from backend.app.orchestration import orchestrator


@patch("backend.app.orchestration.orchestrator.tool")
@patch("backend.app.orchestration.orchestrator.classify")
def test_auto_mode_classifies_then_dispatches(mock_classify, mock_tool):
    mock_classify.return_value = "Tool"
    mock_tool.run.return_value = {"architecture": "Tool Agent", "answer": "1200"}

    result = orchestrator.run("Calculate 25 * 48", mode="auto")

    mock_classify.assert_called_once_with("Calculate 25 * 48")
    mock_tool.run.assert_called_once_with("Calculate 25 * 48")
    assert result["answer"] == "1200"


@patch("backend.app.orchestration.orchestrator.classify")
@patch("backend.app.orchestration.orchestrator.simple")
def test_manual_mode_skips_classifier(mock_simple, mock_classify):
    mock_simple.run.return_value = {"architecture": "Simple", "answer": "hello"}

    result = orchestrator.run("Hi", mode="simple")

    mock_classify.assert_not_called()
    mock_simple.run.assert_called_once_with("Hi")
    assert result["answer"] == "hello"


def test_unknown_mode_raises_value_error():
    with pytest.raises(ValueError, match="Unknown mode"):
        orchestrator.run("Hi", mode="not-a-real-mode")
