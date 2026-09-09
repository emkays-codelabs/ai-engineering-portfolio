"""Response bodies returned by the AgentFlow API.

These mirror `backend.app.agents.base.AgentResult` so FastAPI can generate
accurate OpenAPI docs instead of an untyped `dict` response.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

from typing import Optional

from pydantic import BaseModel


class HealthResponse(BaseModel):
    euri_configured: bool
    tavily_configured: bool


class RunResponse(BaseModel):
    architecture: str
    answer: str
    steps: list[str]
    tools_used: list[str]
    llm_calls: int
    tool_calls: int
    latency_ms: int
    route: Optional[str] = None
    estimated_cost_usd: float


class ErrorResponse(BaseModel):
    error: str
