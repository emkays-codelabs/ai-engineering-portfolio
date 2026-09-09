"""Thin OpenAI-SDK wrapper pointed at the EURI-compatible chat completions endpoint.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from typing import Any

from openai import OpenAI

from backend.app.config import EURI_BASE_URL, EURI_MODEL, euri_api_key

# Kept as module-level aliases so existing callers (`from backend.app.llm.euri_client
# import BASE_URL, MODEL`) keep working; the values themselves live in config.py.
BASE_URL = EURI_BASE_URL
MODEL = EURI_MODEL


class ConfigurationError(RuntimeError):
    """Raised when a required API key or setting is missing."""


def require_api_key() -> str:
    key = euri_api_key()
    if not key:
        raise ConfigurationError(
            "EURI_API_KEY is not set. Copy .env.example to .env and add your EURI API key."
        )
    return key


def get_client() -> OpenAI:
    return OpenAI(api_key=require_api_key(), base_url=BASE_URL)


def chat(messages: list[dict[str, Any]], **kwargs: Any) -> str:
    client = get_client()
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        **kwargs,
    )
    content = response.choices[0].message.content
    if not content:
        raise RuntimeError("EURI returned an empty response.")
    return content.strip()
