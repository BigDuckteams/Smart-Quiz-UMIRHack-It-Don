"""Input sanitization and validation helpers."""

from __future__ import annotations

import logging
from collections.abc import Mapping
from typing import Any

import bleach
from marshmallow import ValidationError

from schemas.quiz_schema import QuizSchema

logger = logging.getLogger(__name__)
ALLOWED_TAGS: list[str] = []


def _cfg(config: Any, key: str, default: int) -> int:
    """Read config value safely from Flask config dict or class/object attributes."""
    if isinstance(config, Mapping):
        value = config.get(key, default)
    else:
        value = getattr(config, key, default)

    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def sanitize_string(value: Any, max_len: int) -> str:
    cleaned = bleach.clean(str(value or '').strip(), tags=ALLOWED_TAGS, strip=True)
    return cleaned[:max_len]


def sanitize_payload(payload: dict[str, Any], config: Any) -> dict[str, Any]:
    max_name = _cfg(config, 'MAX_NAME_LENGTH', 120)
    max_phone = _cfg(config, 'MAX_PHONE_LENGTH', 25)
    max_email = _cfg(config, 'MAX_EMAIL_LENGTH', 254)
    max_comment = _cfg(config, 'MAX_COMMENT_LENGTH', 1200)

    sanitized: dict[str, Any] = {}
    for key, value in payload.items():
        if isinstance(value, str):
            if key == 'phone':
                sanitized[key] = sanitize_string(value, max_phone)
            elif key == 'name':
                sanitized[key] = sanitize_string(value, max_name)
            elif key == 'email':
                sanitized[key] = sanitize_string(value, max_email)
            elif key == 'comment':
                sanitized[key] = sanitize_string(value, max_comment)
            else:
                sanitized[key] = sanitize_string(value, 255)
        elif isinstance(value, list):
            sanitized[key] = [sanitize_string(item, 120) for item in value]
        else:
            sanitized[key] = value
    return sanitized


def has_spam_markers(payload: dict[str, Any]) -> bool:
    combined = ' '.join(str(v).lower() for v in payload.values())
    return any(marker in combined for marker in ['<script', 'javascript:', 'onerror=', 'viagra', 'casino'])


def parse_and_validate_payload(raw_payload: Any, config: Any) -> dict[str, Any]:
    if not isinstance(raw_payload, dict):
        raise ValidationError('Payload must be object')

    payload = sanitize_payload(raw_payload, config)

    if has_spam_markers(payload):
        logger.warning('suspicious_payload_detected')

    return QuizSchema().load(payload)
