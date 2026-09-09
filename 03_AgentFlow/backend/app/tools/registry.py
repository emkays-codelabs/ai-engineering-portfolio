"""Central registry of tools exposed to LLM tool-calling agents.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""


from typing import Any

from backend.app.tools.calculator import calculator
from backend.app.tools.search import search

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "calculator",
            "description": "Perform safe basic arithmetic. Use for numerical calculations.",
            "parameters": {
                "type": "object",
                "properties": {"expression": {"type": "string"}},
                "required": ["expression"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Search the live web for current or factual information.",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        },
    },
]


def execute_tool(name: str, arguments: dict[str, Any]) -> str:
    if name == "calculator":
        return calculator(str(arguments.get("expression", "")))
    if name == "search":
        return search(str(arguments.get("query", "")))
    return f"Unknown tool: {name}"
