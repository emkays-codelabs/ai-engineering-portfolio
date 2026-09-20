import os

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Test-only defaults so importing app modules during collection never hits real
# infrastructure. Individual tests override via monkeypatch when they need to.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-pytest-at-least-32-bytes-long")


@pytest.fixture
def db_session():
    """A real, isolated SQLite-backed session with all models registered on Base.metadata."""
    from app.core.database import Base
    from app.models import token_blacklist, user  # noqa: F401 — registers tables on Base.metadata

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = session_factory()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


@pytest.fixture
def client():
    """A TestClient wired to an isolated in-memory SQLite DB via dependency override.

    StaticPool is required here: FastAPI runs sync path operations in a worker
    thread, and a plain sqlite:///:memory: engine gives each thread its own
    separate (empty) database without it.
    """
    from fastapi.testclient import TestClient

    from app.core.database import Base, get_db
    from app.main import app
    from app.models import token_blacklist, user  # noqa: F401 — registers tables

    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    def override_get_db():
        session = session_factory()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    # Exposed so a test can reach into the exact same DB the app is using (e.g. to
    # set up state a route doesn't itself provide a way to create, like promoting
    # a user to admin) without duplicating the override's engine/session wiring.
    test_client.session_factory = session_factory
    try:
        yield test_client
    finally:
        app.dependency_overrides.clear()
        engine.dispose()
