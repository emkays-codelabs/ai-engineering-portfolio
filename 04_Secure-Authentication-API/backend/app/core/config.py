from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    environment: str = "development"
    # Explicit single origin, never "*" — required because the refresh cookie
    # needs allow_credentials=True, which browsers reject when paired with a
    # wildcard origin.
    frontend_origin: str = "http://localhost:5173"
