from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Caduceus"
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://caduceus:caduceus_dev_password@localhost:5434/caduceus_db"
    redis_url: str = "redis://localhost:6379/0"
    secret_key: str = "development-only-change-me"
    access_token_expire_minutes: int = 30
    openai_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
