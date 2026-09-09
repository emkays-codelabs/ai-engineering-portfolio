"""Web search tool backed by the Tavily API.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""


from typing import Any

from tavily import TavilyClient

from backend.app.config import tavily_api_key
from backend.app.llm.euri_client import ConfigurationError


def search(query: str) -> str:
    """Search the web with Tavily and return compact source summaries."""
    api_key = tavily_api_key()
    if not api_key:
        raise ConfigurationError(
            "TAVILY_API_KEY is not set. Add it to .env to use web search."
        )

    client = TavilyClient(api_key=api_key)
    response: dict[str, Any] = client.search(query=query, max_results=5)
    results = response.get("results", [])
    if not results:
        return "No search results found."

    lines = []
    for idx, item in enumerate(results[:5], start=1):
        title = item.get("title", "Untitled")
        url = item.get("url", "")
        content = (item.get("content") or "").replace("\n", " ")
        lines.append(f"{idx}. {title}\n   {content[:500]}\n   URL: {url}")
    return "\n".join(lines)
