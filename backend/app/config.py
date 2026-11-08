from functools import lru_cache
from typing import Annotated

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FraudShield AI API"
    app_env: str = "development"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./fraudshield.db"
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    ai_mode: str = "remote"
    ai_engine_url: str | None = None
    ai_engine_api_key: str | None = None
    ai_timeout_seconds: float = 5.0

    paypal_base_url: str = "https://api-m.sandbox.paypal.com"
    paypal_client_id: str | None = None
    paypal_client_secret: str | None = None
    paypal_webhook_id: str | None = None
    paypal_return_url: str = "http://localhost:5173/paypal/return"
    paypal_cancel_url: str = "http://localhost:5173/paypal/cancel"
    paypal_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("ai_mode")
    @classmethod
    def validate_ai_mode(cls, value: str) -> str:
        value = value.lower()
        if value not in {"remote", "mock"}:
            raise ValueError("AI_MODE must be 'remote' or 'mock'")
        return value

    @model_validator(mode="after")
    def prevent_mock_ai_in_production(self):
        if self.app_env.lower() in {"production", "prod"} and self.ai_mode == "mock":
            raise ValueError("AI_MODE=mock is not allowed in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()

