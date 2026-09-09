"""ReAct agent: interleaves Thought/Action/Observation steps until a Final Answer.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""


import re
import time

from backend.app.agents.base import AgentResult, make_result
from backend.app.llm.euri_client import chat
from backend.app.tools.calculator import calculator
from backend.app.tools.search import search

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
