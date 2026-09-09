"""Planning agent: generates an explicit multi-step plan, executes each step
with the appropriate tool or an LLM call, then synthesizes a final answer.

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
