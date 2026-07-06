from pydantic import Field
from pydantic_settings import BaseSettings

from src.db_url import normalize_async_database_url


class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    API_KEY: str = Field(..., env="API_KEY")
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def async_database_url(self) -> str:
        return normalize_async_database_url(self.DATABASE_URL)


settings = Settings()
