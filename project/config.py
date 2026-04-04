"""Application configuration module."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass
class Config:
    """Base configuration for the Smart Quiz application."""

    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    SQLALCHEMY_DATABASE_URI: str = os.getenv(
        "DATABASE_URL", "sqlite:///smart_quiz.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    WTF_CSRF_TIME_LIMIT: int = 3600
    JSON_SORT_KEYS: bool = False


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG: bool = True


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG: bool = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}
