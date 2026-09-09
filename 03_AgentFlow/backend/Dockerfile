# AgentFlow backend image: FastAPI + Uvicorn, dependencies managed by uv.
#
# Build context is the repository root (not backend/) because the app is
# imported as the `backend.app.*` package and needs pyproject.toml/uv.lock
# alongside it — see docker-compose.yml's `context: .`.
#
# Author: Mahesh Kumar
# Founder & CEO, SaffronyxAI.in
# Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Dependency layer is cached separately from source so editing agent code
# doesn't force a full reinstall. --no-dev skips pytest/httpx (test-only).
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Application code. No .env / API keys are ever copied into the image —
# they're injected at container runtime via docker-compose's env_file.
COPY backend/ ./backend/

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
