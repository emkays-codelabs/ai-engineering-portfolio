import pytest
from pydantic import ValidationError


def test_settings_loads_required_fields_from_env(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/authdb")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key")

    from app.core.config import Settings

    settings = Settings()

    assert settings.database_url == "postgresql+psycopg://user:pass@localhost:5432/authdb"
    assert settings.secret_key == "test-secret-key"


def test_settings_applies_defaults_when_optional_fields_unset(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/authdb")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key")
    monkeypatch.delenv("ALGORITHM", raising=False)
    monkeypatch.delenv("ACCESS_TOKEN_EXPIRE_MINUTES", raising=False)
    monkeypatch.delenv("REFRESH_TOKEN_EXPIRE_DAYS", raising=False)
    monkeypatch.delenv("FRONTEND_ORIGIN", raising=False)

    from app.core.config import Settings

    settings = Settings()

    assert settings.algorithm == "HS256"
    assert settings.access_token_expire_minutes == 15
    assert settings.refresh_token_expire_days == 7
    assert settings.frontend_origin == "http://localhost:5173"


def test_settings_raises_when_secret_key_missing(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql+psycopg://user:pass@localhost:5432/authdb")
    monkeypatch.delenv("SECRET_KEY", raising=False)

    from app.core.config import Settings

    with pytest.raises(ValidationError):
        Settings(_env_file=None)
