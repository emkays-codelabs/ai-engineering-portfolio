"""Router agent: classifies a question into a route, then dispatches to a specialist path.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import json
import time

from backend.app.agents.base import AgentResult, make_result
from backend.app.llm.euri_client import chat
from backend.app.tools.calculator import calculator
from backend.app.tools.search import search

ROUTER_SYSTEM = (
    'Classify the user query into exactly one category: Math, Coding, Research, or General. '
    'Return JSON only: {"route": "Math|Coding|Research|General"}. Choose Math for calculations, '
    "Coding for programming requests, Research for requests needing current/external information, "
    "otherwise General."
)

_VALID_ROUTES = {"Math", "Coding", "Research", "General"}


def classify(question: str) -> str:
    raw = chat(
        [{"role": "system", "content": ROUTER_SYSTEM}, {"role": "user", "content": question}],
        temperature=0,
    )
    try:
        route = json.loads(raw).get("route", "General")
    except json.JSONDecodeError:
        # Model didn't return valid JSON; fall back to a best-effort token scan.
        route = raw.strip().split()[0].strip("`.,:") if raw.strip() else "General"
    return route if route in _VALID_ROUTES else "General"


def run(question: str) -> AgentResult:
    start = time.perf_counter()
    route = classify(question)
    steps = [f"Classified as {route}"]
    llm_calls = 1
    tool_calls = 0
    tools_used: list[str] = []

    if route == "Math":
        expression = chat(
            [
                {
                    "role": "system",
                    "content": "Extract the arithmetic expression from the user's request. "
                    "Return only the expression, with no explanation.",
                },
                {"role": "user", "content": question},
            ]
        )
        llm_calls += 1
        result = calculator(expression)
        tool_calls += 1
        tools_used.append("calculator")
        steps.append(f"Called calculator({expression!r}) -> {result}")
        answer = chat(
            [
                {
                    "role": "system",
                    "content": "Answer the user's math question using the supplied calculator result. Be concise.",
                },
                {"role": "user", "content": f"Question: {question}\nCalculator result: {result}"},
            ]
        )
        llm_calls += 1
    elif route == "Research":
        result = search(question)
        tool_calls += 1
        tools_used.append("search")
        steps.append("Called search")
        answer = chat(
            [
                {
                    "role": "system",
                    "content": "Answer using the supplied web-search evidence. Distinguish evidence "
                    "from inference and mention sources when useful.",
                },
                {"role": "user", "content": f"Question: {question}\nSearch evidence:\n{result}"},
            ]
        )
        llm_calls += 1
    elif route == "Coding":
        answer = chat(
            [
                {
                    "role": "system",
                    "content": "You are a coding specialist. Write clean, correct, idiomatic code "
                    "and briefly explain important choices.",
                },
                {"role": "user", "content": question},
            ]
        )
        llm_calls += 1
    else:
        answer = chat(
            [
                {"role": "system", "content": "You are a general-purpose assistant. Answer clearly and directly."},
                {"role": "user", "content": question},
            ]
        )
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
