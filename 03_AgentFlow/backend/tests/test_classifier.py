"""Tests for the orchestration classifier.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

from backend.app.orchestration.classifier import classify


@patch("backend.app.orchestration.classifier.chat")
def test_classify_returns_valid_architecture(mock_chat):
    mock_chat.return_value = '{"architecture": "Planner"}'
    assert classify("Compare three frameworks and recommend one.") == "Planner"


@patch("backend.app.orchestration.classifier.chat")
def test_classify_falls_back_to_simple_on_malformed_json(mock_chat):
    mock_chat.return_value = "not json"
    assert classify("Explain RAG.") == "Simple"


@patch("backend.app.orchestration.classifier.chat")
def test_classify_falls_back_to_simple_on_unknown_architecture(mock_chat):
    mock_chat.return_value = '{"architecture": "Unknown"}'
    assert classify("Anything.") == "Simple"
