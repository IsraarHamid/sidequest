"""Central settings, loaded from environment / .env.

Everything is optional so the API can boot for local dev even before
Supabase / Anthropic keys are filled in (endpoints degrade gracefully).
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-5"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    # Live Google Maps grounding needs a billing-enabled Gemini project.
    # Leave False for the free tier (uses Gemini's own knowledge for real places).
    gemini_use_maps_grounding: bool = False

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def ai_enabled(self) -> bool:
        return bool(self.anthropic_api_key)

    @property
    def places_enabled(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
