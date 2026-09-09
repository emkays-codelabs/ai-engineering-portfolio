"""Tests for the evaluation metrics module.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from backend.app.evaluation.metrics import aggregate, estimate_cost_usd


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
