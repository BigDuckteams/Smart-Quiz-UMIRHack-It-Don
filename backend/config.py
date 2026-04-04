"""Configuration for Smart Quiz Flask backend."""

from __future__ import annotations

import os


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
    DEBUG = os.getenv('FLASK_DEBUG', '0') == '1'
    JSON_AS_ASCII = False

    FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:5173')
    RATE_LIMIT = os.getenv('RATE_LIMIT', '5 per minute')
    DUPLICATE_WINDOW_SECONDS = int(os.getenv('DUPLICATE_WINDOW_SECONDS', '120'))

    MAX_CONTENT_LENGTH = 32 * 1024
    MAX_NAME_LENGTH = 120
    MAX_PHONE_LENGTH = 25
    MAX_EMAIL_LENGTH = 254
    MAX_COMMENT_LENGTH = 1200

    SQLITE_PATH = os.getenv('SQLITE_PATH', 'smart_quiz.sqlite3')

    ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin')
    ADMIN_TOKEN_TTL_SECONDS = int(os.getenv('ADMIN_TOKEN_TTL_SECONDS', '28800'))
