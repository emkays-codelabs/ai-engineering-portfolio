"""Tests for the calculator, search, and tool registry.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.app.llm.euri_client import ConfigurationError
from backend.app.tools.calculator import calculator
from backend.app.tools.search import search
from backend.app.tools.registry import TOOL_DEFINITIONS, execute_tool


def test_calculator_basic_arithmetic():
    assert calculator("25 * 48") == "1200"


def test_calculator_rejects_non_arithmetic():
    assert calculator("__import__('os')").startswith("Calculator error")


def test_calculator_division_by_zero():
    assert calculator("1 / 0") == "Calculator error: division by zero."


def test_search_raises_configuration_error_without_key():
    with pytest.raises(ConfigurationError, match="TAVILY_API_KEY"):
        search("anything")


@patch("backend.app.tools.search.TavilyClient")
def test_search_formats_results(mock_client_cls, monkeypatch):
    monkeypatch.setenv("TAVILY_API_KEY", "test-key")
    mock_client = MagicMock()
    mock_client.search.return_value = {
        "results": [{"title": "Result 1", "url": "https://example.com", "content": "Some content"}]
    }
    mock_client_cls.return_value = mock_client

    result = search("test query")

    assert "Result 1" in result
    assert "https://example.com" in result


def test_execute_tool_calculator():
    assert execute_tool("calculator", {"expression": "2 + 2"}) == "4"


@patch("backend.app.tools.registry.search")
def test_execute_tool_search(mock_search):
    mock_search.return_value = "search results"
    assert execute_tool("search", {"query": "AI agents"}) == "search results"


def test_execute_tool_unknown_returns_message():
    assert execute_tool("unknown_tool", {}) == "Unknown tool: unknown_tool"


def test_tool_definitions_cover_calculator_and_search():
    names = {t["function"]["name"] for t in TOOL_DEFINITIONS}
    assert names == {"calculator", "search"}
