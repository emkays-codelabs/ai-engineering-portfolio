"""Tests for the EURI LLM client wrapper.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import MagicMock, patch

import pytest

from backend.app.llm.euri_client import ConfigurationError, chat, require_api_key


def test_require_api_key_raises_configuration_error_when_missing():
    with pytest.raises(ConfigurationError, match="EURI_API_KEY"):
        require_api_key()


def test_require_api_key_returns_key_when_set(monkeypatch):
    monkeypatch.setenv("EURI_API_KEY", "test-key")
    assert require_api_key() == "test-key"


@patch("backend.app.llm.euri_client.OpenAI")
def test_chat_returns_stripped_content(mock_openai_cls, monkeypatch):
    monkeypatch.setenv("EURI_API_KEY", "test-key")
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="  hello  "))]
    mock_client.chat.completions.create.return_value = mock_response
    mock_openai_cls.return_value = mock_client

    result = chat([{"role": "user", "content": "hi"}])

    assert result == "hello"
