import os
from typing import List, Union, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aayuraura Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "ayursetu-sih2k26-secret-key-change-in-production-32bytes"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    # Google OAuth Settings
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # AI Integration Settings
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # SMTP & Two-Step Verification Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@aayuraura.in"
    SMTP_FROM_NAME: str = "Aayuraura Security"
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    REQUIRE_OTP_LOGIN: bool = True
    OTP_EXPIRATION_MINUTES: int = 5

    ENVIRONMENT: str = "development" # "development", "staging", "production"

    # Database Settings
    USE_SQLITE_DEV: bool = True
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "ayursetu_user"
    POSTGRES_PASSWORD: str = "ayursetu_password"
    POSTGRES_DB: str = "ayursetu_db"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            if db_url.startswith("postgres://"):
                return db_url.replace("postgres://", "postgresql+asyncpg://", 1)
            elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+asyncpg://"):
                return db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return db_url
        if self.ENVIRONMENT == "production":
            raise ValueError(
                "CRITICAL CONFIGURATION ERROR: In production mode (ENVIRONMENT=production), "
                "a managed PostgreSQL DATABASE_URL must be provided. SQLite fallback is strictly disallowed."
            )
        if self.USE_SQLITE_DEV and not os.getenv("DOCKER_ENV"):
            return "sqlite+aiosqlite:///./ayursetu_dev.db"
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    @property
    def SYNC_SQLALCHEMY_DATABASE_URI(self) -> str:
        db_url = os.getenv("DATABASE_URL")
        if db_url:
            if db_url.startswith("postgres://"):
                return db_url.replace("postgres://", "postgresql://", 1)
            elif db_url.startswith("postgresql+asyncpg://"):
                return db_url.replace("postgresql+asyncpg://", "postgresql://", 1)
            return db_url
        if self.ENVIRONMENT == "production":
            raise ValueError(
                "CRITICAL CONFIGURATION ERROR: In production mode (ENVIRONMENT=production), "
                "a managed PostgreSQL DATABASE_URL must be provided. SQLite fallback is strictly disallowed."
            )
        if self.USE_SQLITE_DEV and not os.getenv("DOCKER_ENV"):
            return "sqlite:///./ayursetu_dev.db"
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Storage Settings
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "ayursetu-uploads"
    MINIO_SECURE: bool = False

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3000",
    ]

    @property
    def CORS_ORIGINS(self) -> List[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        custom_origins = os.getenv("CORS_ORIGINS")
        if custom_origins:
            for o in custom_origins.split(","):
                clean = o.strip()
                if clean and clean not in origins:
                    origins.append(clean)
        return origins

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
