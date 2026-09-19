"""Central settings, loaded from environment / .env.

Everything is optional so the API can boot for local dev even before
Supabase / Replicate keys are filled in (endpoints degrade gracefully).
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

    replicate_api_key: str = ""
    replicate_model: str = "google/gemini-3.5-flash"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash"
    # Live Google Maps grounding needs a billing-enabled Gemini project.
    # Leave False for the free tier (uses Gemini's own knowledge for real places).
    gemini_use_maps_grounding: bool = False

    # Admin override credentials (NOT hardcoded — from env; seeded into the DB).
    admin_email: str = ""
    admin_password: str = ""

    # Supabase Storage bucket for user-uploaded mission photos.
    storage_bucket: str = "mission-photos"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def ai_enabled(self) -> bool:
        return bool(self.replicate_api_key)

    @property
    def places_enabled(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache
def get_settings() -> Settings:
    return Settings()
