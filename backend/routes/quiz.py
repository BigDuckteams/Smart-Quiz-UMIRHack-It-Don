"""Quiz API routes."""

from __future__ import annotations

import hashlib
import json
import logging
import time
from collections import defaultdict, deque
from typing import Any

from flask import Blueprint, current_app, jsonify, request

from schemas.quiz_schema import QuizSubmissionSchema
from services.submission_service import SubmissionService
from utils.validators import ValidationError, parse_and_validate_payload

quiz_bp = Blueprint("quiz", __name__)
logger = logging.getLogger(__name__)

submission_service = SubmissionService()
REQUESTS: dict[str, deque[float]] = defaultdict(deque)
RECENT_SUBMITS: dict[str, float] = {}


def _client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    return (forwarded.split(",")[0].strip() if forwarded else request.remote_addr) or "unknown"


def _rate_limited(ip: str, limit: int) -> bool:
    now = time.time()
    window = REQUESTS[ip]
    while window and now - window[0] > 60:
        window.popleft()
    if len(window) >= limit:
        return True
    window.append(now)
    return False


def _duplicate(payload: dict[str, Any], ip: str, ttl: int) -> bool:
    now = time.time()
    for key, seen_ts in list(RECENT_SUBMITS.items()):
        if now - seen_ts > ttl:
            RECENT_SUBMITS.pop(key, None)

    fingerprint_source = json.dumps(
        {"phone": payload.get("phone"), "area": payload.get("area"), "ip": ip},
        ensure_ascii=False,
        sort_keys=True,
    )
    fp = hashlib.sha256(fingerprint_source.encode("utf-8")).hexdigest()

    if fp in RECENT_SUBMITS:
        return True

    RECENT_SUBMITS[fp] = now
    return False


@quiz_bp.post("/api/quiz/submit")
def submit_quiz():
    ip = _client_ip()
    cfg = current_app.config

    if _rate_limited(ip, cfg["RATE_LIMIT_PER_MINUTE"]):
        logger.warning("rate_limited", extra={"ip": ip})
        return jsonify({"success": False, "message": "Не удалось отправить заявку"}), 429

    try:
        raw_payload = request.get_json(silent=True) or {}
        payload = parse_and_validate_payload(raw_payload, current_app.config)

        if _duplicate(payload, ip, cfg["DUPLICATE_WINDOW_SECONDS"]):
            logger.info("duplicate_submit_blocked", extra={"ip": ip})
            return jsonify({"success": False, "message": "Не удалось отправить заявку"}), 409

        schema = QuizSubmissionSchema(**payload)
        submission_service.save(schema.__dict__)
        logger.info("quiz_submit_success", extra={"ip": ip})
        return jsonify({"success": True, "message": "Заявка успешно отправлена"}), 200

    except ValidationError as exc:
        logger.info("quiz_submit_validation_error", extra={"ip": ip, "error": str(exc)})
        return jsonify({"success": False, "message": "Не удалось отправить заявку"}), 400
    except Exception:
        logger.exception("quiz_submit_unexpected_error")
        return jsonify({"success": False, "message": "Не удалось отправить заявку"}), 500
