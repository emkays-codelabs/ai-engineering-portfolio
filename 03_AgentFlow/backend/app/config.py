"""Centralized environment configuration for the AgentFlow backend.

Every module that previously called `os.getenv(...)` directly reads its
setting from here instead, so the full list of environment variables the
backend depends on is visible in one place.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import os

from dotenv import load_dotenv

load_dotenv()

EURI_BASE_URL = os.getenv("EURI_BASE_URL", "https://api.euron.one/api/v1/euri")
EURI_MODEL = os.getenv("EURI_MODEL", "gpt-4.1-nano")
CORS_ORIGINS = os.getenv("AGENTFLOW_CORS_ORIGINS", "http://localhost:5173").split(",")


def euri_api_key() -> str:
    """Read EURI_API_KEY fresh on every call (never cached at import time)."""
    return os.getenv("EURI_API_KEY", "").strip()


def tavily_api_key() -> str:
    """Read TAVILY_API_KEY fresh on every call (never cached at import time)."""
    return os.getenv("TAVILY_API_KEY", "").strip()
