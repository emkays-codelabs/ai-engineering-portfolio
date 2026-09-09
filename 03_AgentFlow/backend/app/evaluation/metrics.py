"""Real latency/cost/call-count metrics for the evaluation benchmark.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from backend.app.agents.base import AgentResult

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
