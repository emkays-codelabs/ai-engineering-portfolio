"""Simple agent: one direct LLM call, no tools.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import time

from backend.app.agents.base import AgentResult, make_result
from backend.app.llm.euri_client import chat

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
