"""Tests for the benchmark harness.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

from backend.app.evaluation.benchmark import TEST_PROMPTS, run_benchmark


@patch("backend.app.evaluation.benchmark.orchestrator_run")
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


@patch("backend.app.evaluation.benchmark.orchestrator_run")
def test_run_benchmark_records_errors_without_aborting(mock_orchestrator_run):
    mock_orchestrator_run.side_effect = RuntimeError("EURI_API_KEY is not set.")

    summary = run_benchmark()

    assert len(summary["errors"]) == len(TEST_PROMPTS)
    assert summary["results"] == []
