"""FastAPI app exposing the orchestrator and benchmark as HTTP endpoints.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import CORS_ORIGINS, euri_api_key, tavily_api_key
from backend.app.evaluation.benchmark import run_benchmark
from backend.app.evaluation.metrics import estimate_cost_usd
from backend.app.llm.euri_client import ConfigurationError
from backend.app.orchestration.orchestrator import run as orchestrator_run
from backend.app.schemas.requests import RunRequest
from backend.app.schemas.responses import ErrorResponse, HealthResponse, RunResponse

app = FastAPI(title="AgentFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        euri_configured=bool(euri_api_key()),
        tavily_configured=bool(tavily_api_key()),
    )


@app.post("/api/run", response_model=RunResponse, responses={503: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
def run_agent(request: RunRequest):
    try:
        result = orchestrator_run(request.query, mode=request.mode)
    except ConfigurationError as exc:
        # Missing API keys are a client-fixable config issue, not a server bug.
        return JSONResponse(status_code=503, content={"error": str(exc)})
    except Exception as exc:
        return JSONResponse(status_code=500, content={"error": str(exc)})
    return RunResponse(**result, estimated_cost_usd=estimate_cost_usd(result["llm_calls"]))


@app.post("/api/benchmark")
def run_benchmark_endpoint() -> dict:
    return run_benchmark()
