"""Tests for the FastAPI app's endpoints.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.app.main import app

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


@patch("backend.app.main.orchestrator_run")
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


@patch("backend.app.main.orchestrator_run")
def test_run_endpoint_returns_503_on_configuration_error(mock_run):
    from backend.app.llm.euri_client import ConfigurationError

    mock_run.side_effect = ConfigurationError("EURI_API_KEY is not set.")

    response = client.post("/api/run", json={"query": "hello", "mode": "simple"})

    assert response.status_code == 503
    assert "EURI_API_KEY" in response.json()["error"]


@patch("backend.app.main.orchestrator_run")
def test_run_endpoint_returns_500_on_other_errors(mock_run):
    mock_run.side_effect = RuntimeError("something else broke")

    response = client.post("/api/run", json={"query": "hello", "mode": "simple"})

    assert response.status_code == 500


@patch("backend.app.main.run_benchmark")
def test_benchmark_endpoint_returns_summary(mock_run_benchmark):
    mock_run_benchmark.return_value = {"results": [], "errors": [], "aggregate_by_architecture": {}, "accuracy": "Not yet measured"}

    response = client.post("/api/benchmark")

    assert response.status_code == 200
    assert response.json()["accuracy"] == "Not yet measured"
