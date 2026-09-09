# AgentFlow Backend Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the FastAPI backend orchestrator that wraps the five existing agents (Simple, Tool, Router, ReAct, Planner) behind a uniform result contract, an LLM-based auto-classifier, and three HTTP endpoints (`/api/run`, `/api/benchmark`, `/api/health`), per `docs/superpowers/specs/2026-09-09-agentflow-backend-orchestrator-design.md`.

**Architecture:** Move agent/tool/LLM-client logic from the root `agents/`/`core/` packages into a new `backend/` package (`agents/`, `tools/`, `llm/`, `orchestration/`, `evaluation/`, `api/`). Every agent's `run()` returns the same `AgentResult` TypedDict (architecture, answer, steps, tools_used, llm_calls, tool_calls, latency_ms, route). The orchestrator either classifies-then-dispatches (`mode="auto"`) or dispatches directly (`mode="simple"|"tool"|"router"|"react"|"planner"`). All external calls (EURI chat, Tavily search) are mocked in tests — no network calls in the test suite.

**Tech Stack:** Python 3.12, FastAPI, uvicorn, pytest, unittest.mock, uv (dependency management), the existing `openai` SDK pointed at EURI and `tavily-python`.

---

## Task 1: Backend scaffold, dependencies, pytest config

**Files:**
- Modify: `pyproject.toml`
- Create: `backend/__init__.py`
- Create: `backend/llm/__init__.py`
- Create: `backend/tools/__init__.py`
- Create: `backend/agents/__init__.py`
- Create: `backend/orchestration/__init__.py`
- Create: `backend/evaluation/__init__.py`
- Create: `backend/api/__init__.py`
- Create: `tests/__init__.py`
- Create: `tests/conftest.py`

- [ ] **Step 1: Add backend dependencies and pytest config to `pyproject.toml`**

Add `fastapi` and `uvicorn` to `[project].dependencies`, and a `dependency-groups` section for test tooling, plus pytest config:

```toml
[project]
name = "types-of-agents-task-2"
version = "0.1.0"
description = "AgentFlow: a multi-architecture AI agent orchestration platform (Simple, Tool-Using, Router, ReAct, Planning) on the EURI API and Tavily search."
requires-python = ">=3.10"
dependencies = [
    "openai>=1.0",
    "tavily-python>=0.5",
    "python-dotenv>=1.0",
    "fastapi>=0.115",
    "uvicorn[standard]>=0.30",
]

[dependency-groups]
dev = [
    "pytest>=8.0",
    "httpx>=0.27",
]

[tool.uv]
package = false

[tool.pytest.ini_options]
testpaths = ["tests"]
```

- [ ] **Step 2: Create empty `__init__.py` files for every backend package and the tests package**

```bash
touch backend/__init__.py backend/llm/__init__.py backend/tools/__init__.py backend/agents/__init__.py backend/orchestration/__init__.py backend/evaluation/__init__.py backend/api/__init__.py tests/__init__.py
```

- [ ] **Step 3: Create `tests/conftest.py` so every test starts from a clean, non-network environment**

```python
import pytest


@pytest.fixture(autouse=True)
def _clean_env(monkeypatch):
    """Every test starts with no EURI/Tavily keys unless it sets its own."""
    monkeypatch.delenv("EURI_API_KEY", raising=False)
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)
```

- [ ] **Step 4: Sync dependencies and verify pytest runs with zero tests collected**

```bash
uv sync
uv run pytest -v
```

Expected: `uv sync` installs `fastapi`, `uvicorn`, `pytest`, `httpx`. `pytest -v` prints `no tests ran` (or `collected 0 items`) with exit code 0 or 5 — no import errors.

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml uv.lock backend tests
git commit -m "Scaffold backend/ package and pytest config for AgentFlow orchestrator"
```

---

## Task 2: EURI LLM client (`backend/llm/euri_client.py`)

**Files:**
- Create: `backend/llm/euri_client.py`
- Test: `tests/test_euri_client.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_euri_client.py
from unittest.mock import MagicMock, patch

import pytest

from backend.llm.euri_client import ConfigurationError, chat, require_api_key


def test_require_api_key_raises_configuration_error_when_missing():
    with pytest.raises(ConfigurationError, match="EURI_API_KEY"):
        require_api_key()


def test_require_api_key_returns_key_when_set(monkeypatch):
    monkeypatch.setenv("EURI_API_KEY", "test-key")
    assert require_api_key() == "test-key"


@patch("backend.llm.euri_client.OpenAI")
def test_chat_returns_stripped_content(mock_openai_cls, monkeypatch):
    monkeypatch.setenv("EURI_API_KEY", "test-key")
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [MagicMock(message=MagicMock(content="  hello  "))]
    mock_client.chat.completions.create.return_value = mock_response
    mock_openai_cls.return_value = mock_client

    result = chat([{"role": "user", "content": "hi"}])

    assert result == "hello"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_euri_client.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.llm.euri_client'`.

- [ ] **Step 3: Implement `backend/llm/euri_client.py`**

```python
import os
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

BASE_URL = os.getenv("EURI_BASE_URL", "https://api.euron.one/api/v1/euri")
MODEL = os.getenv("EURI_MODEL", "gpt-4.1-nano")


class ConfigurationError(RuntimeError):
    """Raised when a required API key or setting is missing."""


def require_api_key() -> str:
    key = os.getenv("EURI_API_KEY", "").strip()
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_euri_client.py -v
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/llm/euri_client.py tests/test_euri_client.py
git commit -m "Add backend EURI client with ConfigurationError for missing keys"
```

---

## Task 3: Tools — calculator, search, registry

**Files:**
- Create: `backend/tools/calculator.py`
- Create: `backend/tools/search.py`
- Create: `backend/tools/registry.py`
- Test: `tests/test_tools.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_tools.py
from unittest.mock import MagicMock, patch

import pytest

from backend.llm.euri_client import ConfigurationError
from backend.tools.calculator import calculator
from backend.tools.search import search
from backend.tools.registry import TOOL_DEFINITIONS, execute_tool


def test_calculator_basic_arithmetic():
    assert calculator("25 * 48") == "1200"


def test_calculator_rejects_non_arithmetic():
    assert calculator("__import__('os')").startswith("Calculator error")


def test_calculator_division_by_zero():
    assert calculator("1 / 0") == "Calculator error: division by zero."


def test_search_raises_configuration_error_without_key():
    with pytest.raises(ConfigurationError, match="TAVILY_API_KEY"):
        search("anything")


@patch("backend.tools.search.TavilyClient")
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


@patch("backend.tools.registry.search")
def test_execute_tool_search(mock_search):
    mock_search.return_value = "search results"
    assert execute_tool("search", {"query": "AI agents"}) == "search results"


def test_execute_tool_unknown_returns_message():
    assert execute_tool("unknown_tool", {}) == "Unknown tool: unknown_tool"


def test_tool_definitions_cover_calculator_and_search():
    names = {t["function"]["name"] for t in TOOL_DEFINITIONS}
    assert names == {"calculator", "search"}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_tools.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.tools.calculator'`.

- [ ] **Step 3: Implement the three tool modules**

```python
# backend/tools/calculator.py
import ast
import operator

_ALLOWED_BINARY = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}
_ALLOWED_UNARY = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _safe_eval(node: ast.AST) -> float | int:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and not isinstance(node.value, bool):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BINARY:
        left = _safe_eval(node.left)
        right = _safe_eval(node.right)
        if isinstance(node.op, ast.Pow) and abs(right) > 100:
            raise ValueError("Exponent is too large.")
        return _ALLOWED_BINARY[type(node.op)](left, right)
    if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARY:
        return _ALLOWED_UNARY[type(node.op)](_safe_eval(node.operand))
    raise ValueError("Only numeric arithmetic operators are allowed.")


def calculator(expression: str) -> str:
    """Safely evaluate basic arithmetic without executing arbitrary Python."""
    expression = expression.strip()
    if not expression:
        return "Calculator error: empty expression."
    if len(expression) > 200:
        return "Calculator error: expression is too long."
    try:
        tree = ast.parse(expression, mode="eval")
        result = _safe_eval(tree.body)
        return str(result)
    except ZeroDivisionError:
        return "Calculator error: division by zero."
    except (SyntaxError, ValueError, TypeError, OverflowError) as exc:
        return f"Calculator error: {exc}"
```

```python
# backend/tools/search.py
import os
from typing import Any

from tavily import TavilyClient

from backend.llm.euri_client import ConfigurationError


def search(query: str) -> str:
    """Search the web with Tavily and return compact source summaries."""
    api_key = os.getenv("TAVILY_API_KEY", "").strip()
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
```

```python
# backend/tools/registry.py
from typing import Any

from backend.tools.calculator import calculator
from backend.tools.search import search

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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_tools.py -v
```

Expected: 8 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/tools tests/test_tools.py
git commit -m "Add backend tools: calculator, Tavily search, tool registry"
```

---

## Task 4: Agent result contract (`backend/agents/base.py`)

**Files:**
- Create: `backend/agents/base.py`
- Test: `tests/test_agent_base.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_agent_base.py
from backend.agents.base import AgentResult, make_result


def test_make_result_has_all_required_keys():
    result: AgentResult = make_result(
        architecture="Simple",
        answer="42",
        steps=["Answered directly"],
        tools_used=[],
        llm_calls=1,
        tool_calls=0,
        latency_ms=120,
    )
    assert result == {
        "architecture": "Simple",
        "answer": "42",
        "steps": ["Answered directly"],
        "tools_used": [],
        "llm_calls": 1,
        "tool_calls": 0,
        "latency_ms": 120,
        "route": None,
    }


def test_make_result_accepts_route():
    result = make_result(
        architecture="Router",
        answer="answer",
        steps=["Classified as Math"],
        tools_used=["calculator"],
        llm_calls=3,
        tool_calls=1,
        latency_ms=200,
        route="Math",
    )
    assert result["route"] == "Math"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/test_agent_base.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.agents.base'`.

- [ ] **Step 3: Implement `backend/agents/base.py`**

```python
"""Shared result contract every AgentFlow agent returns."""
from typing import Optional, TypedDict


class AgentResult(TypedDict):
    architecture: str
    answer: str
    steps: list[str]
    tools_used: list[str]
    llm_calls: int
    tool_calls: int
    latency_ms: int
    route: Optional[str]


def make_result(
    *,
    architecture: str,
    answer: str,
    steps: list[str],
    tools_used: list[str],
    llm_calls: int,
    tool_calls: int,
    latency_ms: int,
    route: Optional[str] = None,
) -> AgentResult:
    return AgentResult(
        architecture=architecture,
        answer=answer,
        steps=steps,
        tools_used=tools_used,
        llm_calls=llm_calls,
        tool_calls=tool_calls,
        latency_ms=latency_ms,
        route=route,
    )
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/test_agent_base.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/agents/base.py tests/test_agent_base.py
git commit -m "Add uniform AgentResult contract for all five architectures"
```

---

## Task 5: Simple agent (`backend/agents/simple.py`)

**Files:**
- Create: `backend/agents/simple.py`
- Test: `tests/test_agents_simple.py`

- [ ] **Step 1: Write the failing test**

```python
# tests/test_agents_simple.py
from unittest.mock import patch

from backend.agents import simple


@patch("backend.agents.simple.chat")
def test_simple_agent_returns_uniform_result(mock_chat):
    mock_chat.return_value = "25 * 48 = 1200."

    result = simple.run("What is 25 * 48?")

    assert result["architecture"] == "Simple"
    assert result["answer"] == "25 * 48 = 1200."
    assert result["steps"] == ["Answered directly"]
    assert result["tools_used"] == []
    assert result["llm_calls"] == 1
    assert result["tool_calls"] == 0
    assert result["latency_ms"] >= 0
    mock_chat.assert_called_once()
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/test_agents_simple.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.agents.simple'`.

- [ ] **Step 3: Implement `backend/agents/simple.py`**

```python
import time

from backend.agents.base import AgentResult, make_result
from backend.llm.euri_client import chat

SYSTEM = "You are a simple AI assistant. Answer the user's question directly and clearly. Do not use tools."


def run(question: str) -> AgentResult:
    start = time.perf_counter()
    answer = chat([{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}])
    latency_ms = int((time.perf_counter() - start) * 1000)
    return make_result(
        architecture="Simple",
        answer=answer,
        steps=["Answered directly"],
        tools_used=[],
        llm_calls=1,
        tool_calls=0,
        latency_ms=latency_ms,
    )
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/test_agents_simple.py -v
```

Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/agents/simple.py tests/test_agents_simple.py
git commit -m "Add Simple agent with uniform AgentResult"
```

---

## Task 6: Tool agent (`backend/agents/tool.py`)

**Files:**
- Create: `backend/agents/tool.py`
- Test: `tests/test_agents_tool.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_agents_tool.py
import json
from unittest.mock import MagicMock, patch

from backend.agents import tool


def _tool_call(name: str, arguments: dict, call_id: str = "call_1"):
    call = MagicMock()
    call.id = call_id
    call.function.name = name
    call.function.arguments = json.dumps(arguments)
    return call


@patch("backend.agents.tool.execute_tool")
@patch("backend.agents.tool.get_client")
def test_tool_agent_calls_calculator_then_answers(mock_get_client, mock_execute_tool):
    mock_execute_tool.return_value = "1200"
    mock_client = MagicMock()

    first_response = MagicMock()
    first_response.choices = [MagicMock(message=MagicMock(tool_calls=[_tool_call("calculator", {"expression": "25 * 48"})]))]

    second_response = MagicMock()
    second_message = MagicMock(tool_calls=None, content="25 * 48 = 1200.")
    second_response.choices = [MagicMock(message=second_message)]

    mock_client.chat.completions.create.side_effect = [first_response, second_response]
    mock_get_client.return_value = mock_client

    result = tool.run("Calculate 25 * 48")

    assert result["architecture"] == "Tool Agent"
    assert result["answer"] == "25 * 48 = 1200."
    assert result["tools_used"] == ["calculator"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 2
    assert result["steps"] == ["Called calculator({'expression': '25 * 48'})", "Synthesized final answer"]


@patch("backend.agents.tool.get_client")
def test_tool_agent_answers_directly_without_tools(mock_get_client):
    mock_client = MagicMock()
    response = MagicMock()
    response.choices = [MagicMock(message=MagicMock(tool_calls=None, content="Direct answer."))]
    mock_client.chat.completions.create.return_value = response
    mock_get_client.return_value = mock_client

    result = tool.run("Explain machine learning.")

    assert result["tools_used"] == []
    assert result["llm_calls"] == 1
    assert result["steps"] == ["Answered directly without tools"]
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_agents_tool.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.agents.tool'`.

- [ ] **Step 3: Implement `backend/agents/tool.py`**

```python
import json
import time

from backend.agents.base import AgentResult, make_result
from backend.llm.euri_client import MODEL, get_client
from backend.tools.registry import TOOL_DEFINITIONS, execute_tool

SYSTEM = "You are a tool-using assistant. Decide when a calculator or web search is needed. Use tools for arithmetic and current web information. After receiving tool results, give a concise, accurate final answer."


def run(question: str, max_rounds: int = 4) -> AgentResult:
    start = time.perf_counter()
    client = get_client()
    messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
    used: list[str] = []
    steps: list[str] = []
    llm_calls = 0
    for _ in range(max_rounds):
        response = client.chat.completions.create(model=MODEL, messages=messages, tools=TOOL_DEFINITIONS)
        llm_calls += 1
        message = response.choices[0].message
        if not message.tool_calls:
            steps.append("Synthesized final answer" if used else "Answered directly without tools")
            latency_ms = int((time.perf_counter() - start) * 1000)
            return make_result(
                architecture="Tool Agent",
                answer=message.content or "",
                steps=steps,
                tools_used=used,
                llm_calls=llm_calls,
                tool_calls=len(used),
                latency_ms=latency_ms,
            )
        messages.append(message)
        for call in message.tool_calls:
            args = json.loads(call.function.arguments or "{}")
            used.append(call.function.name)
            steps.append(f"Called {call.function.name}({args})")
            result = execute_tool(call.function.name, args)
            messages.append({"role": "tool", "tool_call_id": call.id, "content": result})
    raise RuntimeError("Tool agent exceeded its maximum tool rounds.")
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_agents_tool.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/agents/tool.py tests/test_agents_tool.py
git commit -m "Add Tool agent with uniform AgentResult and step trace"
```

---

## Task 7: Router agent (`backend/agents/router.py`)

**Files:**
- Create: `backend/agents/router.py`
- Test: `tests/test_agents_router.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_agents_router.py
from unittest.mock import patch

from backend.agents import router


@patch("backend.agents.router.calculator")
@patch("backend.agents.router.chat")
def test_router_math_route(mock_chat, mock_calculator):
    mock_chat.side_effect = [
        '{"route": "Math"}',
        "19 * 37 - 12",
        "The answer is 691.",
    ]
    mock_calculator.return_value = "691"

    result = router.run("What is 19 * 37 - 12?")

    assert result["architecture"] == "Router"
    assert result["route"] == "Math"
    assert result["tools_used"] == ["calculator"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 3
    assert result["answer"] == "The answer is 691."


@patch("backend.agents.router.chat")
def test_router_coding_route(mock_chat):
    mock_chat.side_effect = [
        '{"route": "Coding"}',
        "def factorial(n): return 1 if n <= 1 else n * factorial(n - 1)",
    ]

    result = router.run("Write Python code for factorial using recursion.")

    assert result["route"] == "Coding"
    assert result["tools_used"] == []
    assert result["tool_calls"] == 0
    assert result["llm_calls"] == 2


@patch("backend.agents.router.chat")
def test_router_falls_back_to_general_on_malformed_json(mock_chat):
    mock_chat.side_effect = ["not json", "A general answer."]

    result = router.run("Tell me something interesting.")

    assert result["route"] == "General"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_agents_router.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.agents.router'`.

- [ ] **Step 3: Implement `backend/agents/router.py`**

```python
import json
import time

from backend.agents.base import AgentResult, make_result
from backend.llm.euri_client import chat
from backend.tools.calculator import calculator
from backend.tools.search import search

ROUTER_SYSTEM = """Classify the user query into exactly one category: Math, Coding, Research, or General. Return JSON only: {"route": "Math|Coding|Research|General"}. Choose Math for calculations, Coding for programming requests, Research for requests needing current/external information, otherwise General."""


def classify(question: str) -> str:
    raw = chat([{"role": "system", "content": ROUTER_SYSTEM}, {"role": "user", "content": question}], temperature=0)
    try:
        route = json.loads(raw).get("route", "General")
    except json.JSONDecodeError:
        route = raw.strip().split()[0].strip("`.,:")
    return route if route in {"Math", "Coding", "Research", "General"} else "General"


def run(question: str) -> AgentResult:
    start = time.perf_counter()
    route = classify(question)
    steps = [f"Classified as {route}"]
    llm_calls = 1
    tool_calls = 0
    tools_used: list[str] = []

    if route == "Math":
        expression = chat([{"role": "system", "content": "Extract the arithmetic expression from the user's request. Return only the expression, with no explanation."}, {"role": "user", "content": question}])
        llm_calls += 1
        result = calculator(expression)
        tool_calls += 1
        tools_used.append("calculator")
        steps.append(f"Called calculator({expression!r}) -> {result}")
        answer = chat([{"role": "system", "content": "Answer the user's math question using the supplied calculator result. Be concise."}, {"role": "user", "content": f"Question: {question}\nCalculator result: {result}"}])
        llm_calls += 1
    elif route == "Research":
        result = search(question)
        tool_calls += 1
        tools_used.append("search")
        steps.append("Called search")
        answer = chat([{"role": "system", "content": "Answer using the supplied web-search evidence. Distinguish evidence from inference and mention sources when useful."}, {"role": "user", "content": f"Question: {question}\nSearch evidence:\n{result}"}])
        llm_calls += 1
    elif route == "Coding":
        answer = chat([{"role": "system", "content": "You are a coding specialist. Write clean, correct, idiomatic code and briefly explain important choices."}, {"role": "user", "content": question}])
        llm_calls += 1
    else:
        answer = chat([{"role": "system", "content": "You are a general-purpose assistant. Answer clearly and directly."}, {"role": "user", "content": question}])
        llm_calls += 1

    steps.append("Synthesized final answer")
    latency_ms = int((time.perf_counter() - start) * 1000)
    return make_result(
        architecture="Router",
        answer=answer,
        steps=steps,
        tools_used=tools_used,
        llm_calls=llm_calls,
        tool_calls=tool_calls,
        latency_ms=latency_ms,
        route=route,
    )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_agents_router.py -v
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/agents/router.py tests/test_agents_router.py
git commit -m "Add Router agent with uniform AgentResult and route field"
```

---

## Task 8: ReAct agent (`backend/agents/react.py`)

**Files:**
- Create: `backend/agents/react.py`
- Test: `tests/test_agents_react.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_agents_react.py
from unittest.mock import patch

from backend.agents import react


@patch("backend.agents.react.calculator")
@patch("backend.agents.react.chat")
def test_react_agent_uses_calculator_then_answers(mock_chat, mock_calculator):
    mock_chat.side_effect = [
        "Thought: I need to calculate this.\nAction: calculator[25 * 48]",
        "Thought: I have the result.\nFinal Answer: 25 * 48 = 1200.",
    ]
    mock_calculator.return_value = "1200"

    result = react.run("What is 25 * 48?")

    assert result["architecture"] == "ReAct"
    assert result["answer"] == "25 * 48 = 1200."
    assert result["tools_used"] == ["calculator"]
    assert result["tool_calls"] == 1
    assert result["llm_calls"] == 2
    assert len(result["steps"]) == 3  # first response, observation, second response


@patch("backend.agents.react.chat")
def test_react_agent_raises_after_max_iterations_without_final_answer(mock_chat):
    mock_chat.return_value = "Thought: still thinking.\nAction: calculator[1 + 1]"

    with patch("backend.agents.react.calculator", return_value="2"):
        try:
            react.run("Never finishes.", max_iterations=2)
            assert False, "expected RuntimeError"
        except RuntimeError as exc:
            assert "did not produce a Final Answer" in str(exc)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_agents_react.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.agents.react'`.

- [ ] **Step 3: Implement `backend/agents/react.py`**

```python
import re
import time

from backend.agents.base import AgentResult, make_result
from backend.llm.euri_client import chat
from backend.tools.calculator import calculator
from backend.tools.search import search

SYSTEM = """You are a ReAct agent. Work through a question using an explicit loop. If a tool is needed, output exactly:
Thought: <brief reasoning>
Action: calculator[<arithmetic expression>] OR Action: search[<web query>]
If no more tools are needed, output exactly:
Thought: <brief reasoning>
Final Answer: <answer>
Do not use any other Action names."""


def _parse_action(text: str):
    match = re.search(r"Action:\s*(calculator|search)\[(.*?)\]", text, re.DOTALL | re.IGNORECASE)
    return (match.group(1).lower(), match.group(2).strip()) if match else None


def run(question: str, max_iterations: int = 4) -> AgentResult:
    start = time.perf_counter()
    steps: list[str] = []
    tools_used: list[str] = []
    context = question
    llm_calls = 0
    for _ in range(max_iterations):
        prompt = SYSTEM + "\n\nQuestion: " + question + "\n\nTrace so far:\n" + ("\n".join(steps) or "(none)")
        response = chat([{"role": "system", "content": prompt}, {"role": "user", "content": context}])
        llm_calls += 1
        steps.append(response)
        final = re.search(r"Final Answer:\s*(.*)", response, re.DOTALL | re.IGNORECASE)
        if final:
            latency_ms = int((time.perf_counter() - start) * 1000)
            return make_result(
                architecture="ReAct",
                answer=final.group(1).strip(),
                steps=steps,
                tools_used=tools_used,
                llm_calls=llm_calls,
                tool_calls=len(tools_used),
                latency_ms=latency_ms,
            )
        action = _parse_action(response)
        if not action:
            context = "Your previous response did not contain a valid Action or Final Answer. Follow the required format."
            continue
        name, argument = action
        tools_used.append(name)
        observation = calculator(argument) if name == "calculator" else search(argument)
        steps.append("Observation: " + observation)
        context = "Use the observation above and continue the ReAct loop."
    raise RuntimeError("ReAct agent did not produce a Final Answer within the iteration limit.")
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_agents_react.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/agents/react.py tests/test_agents_react.py
git commit -m "Add ReAct agent with uniform AgentResult and step trace"
```

---

## Task 9: Planning agent (`backend/agents/planner.py`)

**Files:**
- Create: `backend/agents/planner.py`
- Test: `tests/test_agents_planner.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_agents_planner.py
import json
from unittest.mock import patch

from backend.agents import planner


@patch("backend.agents.planner.search")
@patch("backend.agents.planner.chat")
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


@patch("backend.agents.planner.chat")
def test_planner_raises_on_invalid_plan_json(mock_chat):
    mock_chat.return_value = "not valid json"

    try:
        planner.run("Anything")
        assert False, "expected RuntimeError"
    except RuntimeError as exc:
        assert "invalid JSON" in str(exc)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_agents_planner.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.agents.planner'`.

- [ ] **Step 3: Implement `backend/agents/planner.py`**

```python
import json
import time

from backend.agents.base import AgentResult, make_result
from backend.llm.euri_client import chat
from backend.tools.calculator import calculator
from backend.tools.search import search

PLAN_SYSTEM = """Create a practical multi-step plan for the user's query. Return JSON only in this shape: {"steps":[{"description":"short step","tool":"calculator|search|llm"}]}. Use calculator for arithmetic, search for current/external facts, and llm for reasoning/writing. Keep 2-5 steps."""


def make_plan(question: str) -> list[dict]:
    raw = chat([{"role": "system", "content": PLAN_SYSTEM}, {"role": "user", "content": question}], temperature=0)
    try:
        data = json.loads(raw)
        steps = data.get("steps", [])
        if not isinstance(steps, list) or not steps:
            raise ValueError("Plan contains no steps.")
        return steps[:5]
    except (json.JSONDecodeError, ValueError) as exc:
        raise RuntimeError(f"Planner returned invalid JSON: {exc}")


def run(question: str) -> AgentResult:
    start = time.perf_counter()
    plan = make_plan(question)
    llm_calls = 1
    tool_calls = 0
    tools_used: list[str] = []
    trace = [f"Generated plan with {len(plan)} steps"]
    results = []
    for index, step in enumerate(plan, start=1):
        description = str(step.get("description", ""))
        tool = str(step.get("tool", "llm")).lower()
        if tool == "calculator":
            extraction = chat([{"role": "system", "content": "Extract only the arithmetic expression needed for this step."}, {"role": "user", "content": description + "\nOriginal question: " + question}])
            llm_calls += 1
            output = calculator(extraction)
            tool_calls += 1
            tools_used.append("calculator")
        elif tool == "search":
            output = search(description + "\nContext: " + question)
            tool_calls += 1
            tools_used.append("search")
        else:
            output = chat([{"role": "system", "content": "Complete this plan step accurately and concisely."}, {"role": "user", "content": f"Original question: {question}\nStep: {description}"}])
            llm_calls += 1
        trace.append(f"Step {index} [{tool}]: {description} -> {output}")
        results.append({"step": index, "description": description, "tool": tool, "result": output})

    evidence = "\n\n".join(f"Step {r['step']} ({r['tool']}): {r['description']}\nResult: {r['result']}" for r in results)
    answer = chat([{"role": "system", "content": "Synthesize a final answer from the executed plan results. Do not claim facts unsupported by the results. Answer the original question clearly."}, {"role": "user", "content": f"Original question: {question}\n\nExecuted plan:\n{evidence}"}])
    llm_calls += 1
    trace.append("Synthesized final answer")
    latency_ms = int((time.perf_counter() - start) * 1000)
    return make_result(
        architecture="Planner",
        answer=answer,
        steps=trace,
        tools_used=list(dict.fromkeys(tools_used)),
        llm_calls=llm_calls,
        tool_calls=tool_calls,
        latency_ms=latency_ms,
    )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_agents_planner.py -v
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/agents/planner.py tests/test_agents_planner.py
git commit -m "Add Planning agent with uniform AgentResult and step trace"
```

---

## Task 10: Auto-classifier (`backend/orchestration/classifier.py`)

**Files:**
- Create: `backend/orchestration/classifier.py`
- Test: `tests/test_classifier.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_classifier.py
from unittest.mock import patch

from backend.orchestration.classifier import classify


@patch("backend.orchestration.classifier.chat")
def test_classify_returns_valid_architecture(mock_chat):
    mock_chat.return_value = '{"architecture": "Planner"}'
    assert classify("Compare three frameworks and recommend one.") == "Planner"


@patch("backend.orchestration.classifier.chat")
def test_classify_falls_back_to_simple_on_malformed_json(mock_chat):
    mock_chat.return_value = "not json"
    assert classify("Explain RAG.") == "Simple"


@patch("backend.orchestration.classifier.chat")
def test_classify_falls_back_to_simple_on_unknown_architecture(mock_chat):
    mock_chat.return_value = '{"architecture": "Unknown"}'
    assert classify("Anything.") == "Simple"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_classifier.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.orchestration.classifier'`.

- [ ] **Step 3: Implement `backend/orchestration/classifier.py`**

```python
import json

from backend.llm.euri_client import chat

VALID_ARCHITECTURES = {"Simple", "Tool", "Router", "ReAct", "Planner"}

CLASSIFIER_SYSTEM = """Choose the single best agent architecture for the user's query. Return JSON only: {"architecture": "Simple|Tool|Router|ReAct|Planner"}.

Guidance (low to high complexity):
- Simple: direct conceptual questions needing no tools or external data.
- Tool: needs one calculation or one piece of current information.
- Router: fits cleanly into a known domain (math, coding, research, general) and benefits from a specialized prompt.
- ReAct: needs iterative reasoning where later actions depend on earlier tool observations.
- Planner: multi-step tasks needing a plan, several pieces of evidence, and a synthesis step."""


def classify(question: str) -> str:
    raw = chat([{"role": "system", "content": CLASSIFIER_SYSTEM}, {"role": "user", "content": question}], temperature=0)
    try:
        architecture = json.loads(raw).get("architecture", "Simple")
    except json.JSONDecodeError:
        architecture = raw.strip().split()[0].strip("`.,:")
    return architecture if architecture in VALID_ARCHITECTURES else "Simple"
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_classifier.py -v
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/orchestration/classifier.py tests/test_classifier.py
git commit -m "Add LLM classifier for AgentFlow auto architecture selection"
```

---

## Task 11: Orchestrator (`backend/orchestration/orchestrator.py`)

**Files:**
- Create: `backend/orchestration/orchestrator.py`
- Test: `tests/test_orchestrator.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_orchestrator.py
from unittest.mock import patch

import pytest

from backend.orchestration import orchestrator


@patch("backend.orchestration.orchestrator.tool")
@patch("backend.orchestration.orchestrator.classify")
def test_auto_mode_classifies_then_dispatches(mock_classify, mock_tool):
    mock_classify.return_value = "Tool"
    mock_tool.run.return_value = {"architecture": "Tool Agent", "answer": "1200"}

    result = orchestrator.run("Calculate 25 * 48", mode="auto")

    mock_classify.assert_called_once_with("Calculate 25 * 48")
    mock_tool.run.assert_called_once_with("Calculate 25 * 48")
    assert result["answer"] == "1200"


@patch("backend.orchestration.orchestrator.classify")
@patch("backend.orchestration.orchestrator.simple")
def test_manual_mode_skips_classifier(mock_simple, mock_classify):
    mock_simple.run.return_value = {"architecture": "Simple", "answer": "hello"}

    result = orchestrator.run("Hi", mode="simple")

    mock_classify.assert_not_called()
    mock_simple.run.assert_called_once_with("Hi")
    assert result["answer"] == "hello"


def test_unknown_mode_raises_value_error():
    with pytest.raises(ValueError, match="Unknown mode"):
        orchestrator.run("Hi", mode="not-a-real-mode")
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_orchestrator.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.orchestration.orchestrator'`.

- [ ] **Step 3: Implement `backend/orchestration/orchestrator.py`**

```python
from backend.agents import planner, react, router, simple, tool
from backend.agents.base import AgentResult
from backend.orchestration.classifier import classify

_AGENTS = {
    "simple": simple,
    "tool": tool,
    "router": router,
    "react": react,
    "planner": planner,
}

_ARCHITECTURE_TO_MODE = {
    "Simple": "simple",
    "Tool": "tool",
    "Router": "router",
    "ReAct": "react",
    "Planner": "planner",
}


def run(question: str, mode: str = "auto") -> AgentResult:
    mode = mode.lower()
    if mode == "auto":
        architecture = classify(question)
        mode = _ARCHITECTURE_TO_MODE[architecture]
    if mode not in _AGENTS:
        raise ValueError(f"Unknown mode: {mode}")
    return _AGENTS[mode].run(question)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_orchestrator.py -v
```

Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/orchestration/orchestrator.py tests/test_orchestrator.py
git commit -m "Add orchestrator: auto-classify or manual dispatch to any architecture"
```

---

## Task 12: Evaluation — metrics and benchmark

**Files:**
- Create: `backend/evaluation/metrics.py`
- Create: `backend/evaluation/benchmark.py`
- Test: `tests/test_metrics.py`
- Test: `tests/test_benchmark.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_metrics.py
from backend.evaluation.metrics import aggregate, estimate_cost_usd


def test_estimate_cost_usd_scales_with_llm_calls():
    assert estimate_cost_usd(1) > 0
    assert estimate_cost_usd(2) == round(estimate_cost_usd(1) * 2, 5)


def test_aggregate_computes_averages():
    results = [
        {"architecture": "Simple", "latency_ms": 100, "llm_calls": 1, "tool_calls": 0},
        {"architecture": "Simple", "latency_ms": 200, "llm_calls": 1, "tool_calls": 0},
    ]
    summary = aggregate(results)
    assert summary["count"] == 2
    assert summary["avg_latency_ms"] == 150.0
    assert summary["avg_llm_calls"] == 1.0
    assert summary["avg_tool_calls"] == 0.0


def test_aggregate_empty_list():
    summary = aggregate([])
    assert summary["count"] == 0
    assert summary["avg_latency_ms"] == 0
```

```python
# tests/test_benchmark.py
from unittest.mock import patch

from backend.evaluation.benchmark import TEST_PROMPTS, run_benchmark


@patch("backend.evaluation.benchmark.orchestrator_run")
def test_run_benchmark_aggregates_by_architecture(mock_orchestrator_run):
    mock_orchestrator_run.return_value = {
        "architecture": "Simple",
        "answer": "ok",
        "steps": ["Answered directly"],
        "tools_used": [],
        "llm_calls": 1,
        "tool_calls": 0,
        "latency_ms": 100,
        "route": None,
    }

    summary = run_benchmark()

    assert mock_orchestrator_run.call_count == len(TEST_PROMPTS)
    assert summary["accuracy"] == "Not yet measured"
    assert "Simple" in summary["aggregate_by_architecture"]
    assert summary["errors"] == []


@patch("backend.evaluation.benchmark.orchestrator_run")
def test_run_benchmark_records_errors_without_aborting(mock_orchestrator_run):
    mock_orchestrator_run.side_effect = RuntimeError("EURI_API_KEY is not set.")

    summary = run_benchmark()

    assert len(summary["errors"]) == len(TEST_PROMPTS)
    assert summary["results"] == []
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_metrics.py tests/test_benchmark.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.evaluation.metrics'`.

- [ ] **Step 3: Implement the evaluation modules**

```python
# backend/evaluation/metrics.py
from backend.agents.base import AgentResult

COST_PER_1K_TOKENS_USD = 0.0005  # Rough estimate for a gpt-4.1-nano-class model; not billed cost.
AVG_TOKENS_PER_LLM_CALL = 600  # Rough estimate covering prompt + completion for these system prompts.


def estimate_cost_usd(llm_calls: int) -> float:
    tokens = llm_calls * AVG_TOKENS_PER_LLM_CALL
    return round((tokens / 1000) * COST_PER_1K_TOKENS_USD, 5)


def aggregate(results: list[AgentResult]) -> dict:
    if not results:
        return {"count": 0, "avg_latency_ms": 0, "avg_llm_calls": 0, "avg_tool_calls": 0, "avg_cost_usd": 0}
    count = len(results)
    return {
        "count": count,
        "avg_latency_ms": round(sum(r["latency_ms"] for r in results) / count, 1),
        "avg_llm_calls": round(sum(r["llm_calls"] for r in results) / count, 2),
        "avg_tool_calls": round(sum(r["tool_calls"] for r in results) / count, 2),
        "avg_cost_usd": round(sum(estimate_cost_usd(r["llm_calls"]) for r in results) / count, 5),
    }
```

```python
# backend/evaluation/benchmark.py
from backend.evaluation.metrics import aggregate, estimate_cost_usd
from backend.orchestration.orchestrator import run as orchestrator_run

TEST_PROMPTS = [
    {"id": 1, "prompt": "What is 25 * 48?", "mode": "simple"},
    {"id": 2, "prompt": "Explain machine learning in simple terms.", "mode": "simple"},
    {"id": 3, "prompt": "Calculate 1250 / 25 + 17.", "mode": "tool"},
    {"id": 4, "prompt": "Find the latest information about AI agents.", "mode": "tool"},
    {"id": 5, "prompt": "What is 19 * 37 - 12?", "mode": "router"},
    {"id": 6, "prompt": "Write Python code for factorial using recursion.", "mode": "router"},
    {"id": 7, "prompt": "What are the latest major developments in generative AI this week?", "mode": "react"},
    {"id": 8, "prompt": "Calculate 48 * 25 and explain the result.", "mode": "react"},
    {"id": 9, "prompt": "Compare the current roles of an AI architect and an AI generalist.", "mode": "planner"},
    {"id": 10, "prompt": "Research the latest Python release and summarize three notable changes.", "mode": "planner"},
    {"id": 11, "prompt": "Explain why tool use can improve reliability for arithmetic questions.", "mode": "planner"},
    {"id": 12, "prompt": "Find current information about the EURI API and summarize what it is used for.", "mode": "tool"},
]


def run_benchmark() -> dict:
    results = []
    errors = []
    for test in TEST_PROMPTS:
        try:
            result = orchestrator_run(test["prompt"], mode=test["mode"])
            results.append({**test, "result": result, "estimated_cost_usd": estimate_cost_usd(result["llm_calls"])})
        except Exception as exc:
            errors.append({**test, "error": str(exc)})

    by_architecture: dict[str, list] = {}
    for entry in results:
        by_architecture.setdefault(entry["result"]["architecture"], []).append(entry["result"])

    return {
        "results": results,
        "errors": errors,
        "aggregate_by_architecture": {name: aggregate(items) for name, items in by_architecture.items()},
        "accuracy": "Not yet measured",
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_metrics.py tests/test_benchmark.py -v
```

Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/evaluation tests/test_metrics.py tests/test_benchmark.py
git commit -m "Add evaluation layer: real latency/cost metrics, honest 'Not yet measured' accuracy"
```

---

## Task 13: FastAPI app (`backend/api/main.py`)

**Files:**
- Create: `backend/api/main.py`
- Test: `tests/test_api.py`

- [ ] **Step 1: Write the failing tests**

```python
# tests/test_api.py
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.api.main import app

client = TestClient(app)


def test_health_reports_unconfigured_keys_by_default():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"euri_configured": False, "tavily_configured": False}


def test_health_reports_configured_keys(monkeypatch):
    monkeypatch.setenv("EURI_API_KEY", "key")
    monkeypatch.setenv("TAVILY_API_KEY", "key")
    response = client.get("/api/health")
    assert response.json() == {"euri_configured": True, "tavily_configured": True}


@patch("backend.api.main.orchestrator_run")
def test_run_endpoint_returns_result_with_cost(mock_run):
    mock_run.return_value = {
        "architecture": "Simple",
        "answer": "hi",
        "steps": ["Answered directly"],
        "tools_used": [],
        "llm_calls": 1,
        "tool_calls": 0,
        "latency_ms": 50,
        "route": None,
    }

    response = client.post("/api/run", json={"query": "hello", "mode": "simple"})

    assert response.status_code == 200
    body = response.json()
    assert body["answer"] == "hi"
    assert "estimated_cost_usd" in body
    mock_run.assert_called_once_with("hello", mode="simple")


@patch("backend.api.main.orchestrator_run")
def test_run_endpoint_returns_503_on_configuration_error(mock_run):
    from backend.llm.euri_client import ConfigurationError

    mock_run.side_effect = ConfigurationError("EURI_API_KEY is not set.")

    response = client.post("/api/run", json={"query": "hello", "mode": "simple"})

    assert response.status_code == 503
    assert "EURI_API_KEY" in response.json()["error"]


@patch("backend.api.main.orchestrator_run")
def test_run_endpoint_returns_500_on_other_errors(mock_run):
    mock_run.side_effect = RuntimeError("something else broke")

    response = client.post("/api/run", json={"query": "hello", "mode": "simple"})

    assert response.status_code == 500


@patch("backend.api.main.run_benchmark")
def test_benchmark_endpoint_returns_summary(mock_run_benchmark):
    mock_run_benchmark.return_value = {"results": [], "errors": [], "aggregate_by_architecture": {}, "accuracy": "Not yet measured"}

    response = client.post("/api/benchmark")

    assert response.status_code == 200
    assert response.json()["accuracy"] == "Not yet measured"
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
uv run pytest tests/test_api.py -v
```

Expected: FAIL with `ModuleNotFoundError: No module named 'backend.api.main'`.

- [ ] **Step 3: Implement `backend/api/main.py`**

```python
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.evaluation.benchmark import run_benchmark
from backend.evaluation.metrics import estimate_cost_usd
from backend.llm.euri_client import ConfigurationError
from backend.orchestration.orchestrator import run as orchestrator_run

app = FastAPI(title="AgentFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("AGENTFLOW_CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    query: str
    mode: str = "auto"


@app.get("/api/health")
def health() -> dict:
    return {
        "euri_configured": bool(os.getenv("EURI_API_KEY", "").strip()),
        "tavily_configured": bool(os.getenv("TAVILY_API_KEY", "").strip()),
    }


@app.post("/api/run")
def run_agent(request: RunRequest):
    try:
        result = orchestrator_run(request.query, mode=request.mode)
    except ConfigurationError as exc:
        return JSONResponse(status_code=503, content={"error": str(exc)})
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})
    return {**result, "estimated_cost_usd": estimate_cost_usd(result["llm_calls"])}


@app.post("/api/benchmark")
def run_benchmark_endpoint() -> dict:
    return run_benchmark()
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
uv run pytest tests/test_api.py -v
```

Expected: 6 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/api/main.py tests/test_api.py
git commit -m "Add FastAPI app: /api/run, /api/benchmark, /api/health"
```

---

## Task 14: Retire root agents/core, add CLI wrappers, update run_all.py and README

**Files:**
- Delete: `agents/` (root-level package), `core/`
- Create: `cli/simple_agent.py`, `cli/tool_agent.py`, `cli/router_agent.py`, `cli/react_agent.py`, `cli/planning_agent.py`
- Modify: `run_all.py`
- Modify: `README.md`

- [ ] **Step 1: Remove the old root-level `agents/` and `core/` packages**

```bash
git rm -r agents core
```

Expected: both directories removed from the working tree and staged for deletion.

- [ ] **Step 2: Create thin CLI wrapper scripts under `cli/` that call the new backend agents**

```python
# cli/simple_agent.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.agents import simple

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/simple_agent.py "question"')
        raise SystemExit(1)
    try:
        result = simple.run(" ".join(sys.argv[1:]))
        print(result["answer"])
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
```

```python
# cli/tool_agent.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.agents import tool

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/tool_agent.py "question"')
        raise SystemExit(1)
    try:
        result = tool.run(" ".join(sys.argv[1:]))
        print(f"Tool used: {', '.join(result['tools_used']) or 'None'}\n\n{result['answer']}")
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
```

```python
# cli/router_agent.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.agents import router

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/router_agent.py "question"')
        raise SystemExit(1)
    try:
        result = router.run(" ".join(sys.argv[1:]))
        print(f"Route: {result['route']}\nTool: {', '.join(result['tools_used']) or 'None'}\n\n{result['answer']}")
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
```

```python
# cli/react_agent.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.agents import react

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/react_agent.py "question"')
        raise SystemExit(1)
    try:
        result = react.run(" ".join(sys.argv[1:]))
        print("\n\n".join(result["steps"]))
        print(f"\nFinal Answer: {result['answer']}")
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
```

```python
# cli/planning_agent.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.agents import planner

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/planning_agent.py "question"')
        raise SystemExit(1)
    try:
        result = planner.run(" ".join(sys.argv[1:]))
        print("\n".join(result["steps"]))
        print(f"\nFinal Answer:\n{result['answer']}")
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
```

- [ ] **Step 3: Rewrite `run_all.py` to use the new benchmark module**

```python
# run_all.py
import json
from pathlib import Path

from backend.evaluation.benchmark import run_benchmark


def main():
    summary = run_benchmark()

    for entry in summary["results"]:
        result = entry["result"]
        print(f"\n{'='*80}\nTest {entry['id']}: {entry['prompt']}\nArchitecture: {result['architecture']}")
        print(f"Tool(s): {', '.join(result['tools_used']) or 'None'}\nAnswer: {result['answer']}")

    for entry in summary["errors"]:
        print(f"\n{'='*80}\nTest {entry['id']}: {entry['prompt']}\nERROR: {entry['error']}")

    print("\n" + "=" * 80)
    print("Aggregate by architecture:")
    print(json.dumps(summary["aggregate_by_architecture"], indent=2))
    print(f"Accuracy: {summary['accuracy']}")

    Path("test_results.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nSaved full results to test_results.json")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Verify the CLI wrappers and the full test suite still work end-to-end**

```bash
uv run pytest -v
uv run python cli/simple_agent.py "What is 2+2?"
```

Expected: all backend tests pass (28 total across Tasks 2–13); the CLI command prints the clean `Error: EURI_API_KEY is not set...` message (no API key configured in this environment), not a stack trace.

- [ ] **Step 5: Update `README.md` run instructions and project structure, then commit**

Update the "Project structure" and "Run each agent" sections of `README.md` to reflect `backend/`, `cli/`, and the new `uv run cli/<agent>_agent.py "question"` commands, and add a short "Run the API" section:

```bash
uv run uvicorn backend.api.main:app --reload --port 8000
```

```bash
git add -A
git commit -m "Retire root agents/core in favor of backend/; add CLI wrappers and API run instructions"
```

---

## Self-Review Notes

- **Spec coverage:** every endpoint (`/api/run`, `/api/benchmark`, `/api/health`), the uniform `AgentResult` contract, the classifier, the honest "Not yet measured" accuracy, and the `backend/` layout from the design doc each map to a task above.
- **Type consistency:** all five agents and the orchestrator use the same `AgentResult` keys (`architecture`, `answer`, `steps`, `tools_used`, `llm_calls`, `tool_calls`, `latency_ms`, `route`) defined once in `backend/agents/base.py` and never renamed across tasks.
- **No placeholders:** every step includes complete, runnable code; no "TBD" or "add error handling" left unresolved.

---

© 2026 SaffronyxAI.in. All Rights Reserved.
Created by Mahesh Kumar, Founder & CEO of SaffronyxAI.in.
