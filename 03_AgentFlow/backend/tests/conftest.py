"""Shared pytest fixtures for the AgentFlow backend test suite.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import shutil
from pathlib import Path

import pytest


@pytest.fixture(autouse=True)
def _clean_env(monkeypatch):
    """Every test starts with no EURI/Tavily keys unless it sets its own."""
    monkeypatch.delenv("EURI_API_KEY", raising=False)
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)


def pytest_sessionfinish(session, exitstatus):
    """Remove every __pycache__/ created by this run so the repo stays clean
    without relying on someone remembering to delete them by hand."""
    repo_root = Path(__file__).resolve().parent.parent.parent
    for cache_dir in repo_root.rglob("__pycache__"):
        if "node_modules" in cache_dir.parts or ".venv" in cache_dir.parts:
            continue
        shutil.rmtree(cache_dir, ignore_errors=True)
