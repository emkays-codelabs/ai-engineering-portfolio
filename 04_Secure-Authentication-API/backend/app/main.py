from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1.router import api_router
from app.core.database import settings
from app.middleware.exception_handlers import register_exception_handlers

app = FastAPI(title="Secure Authentication API")

# Explicit single origin + allow_credentials — required for the refresh cookie;
# never a wildcard origin here (browsers reject "*" combined with credentials).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(health_router)
app.include_router(api_router, prefix="/api/v1")
