"""Tool-using agent: lets the model decide when to call calculator/search tools.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import json
import time

from backend.app.agents.base import AgentResult, make_result
from backend.app.llm.euri_client import MODEL, get_client
from backend.app.tools.registry import TOOL_DEFINITIONS, execute_tool

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
