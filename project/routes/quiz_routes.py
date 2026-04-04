"""HTTP routes for Smart Quiz."""

from __future__ import annotations

import logging

from flask import Blueprint, current_app, jsonify, render_template, request
from flask_wtf.csrf import CSRFError

from services.quiz_service import save_submission
from utils.validators import ValidationError, validate_quiz_payload

quiz_bp = Blueprint("quiz", __name__)
logger = logging.getLogger(__name__)


@quiz_bp.get("/")
def index():
    """Render quiz page."""
    try:
        return render_template("index.html")
    except Exception:
        logger.exception("Failed to render index page")
        return "Internal server error", 500


@quiz_bp.get("/success")
def success():
    """Render success page."""
    try:
        return render_template("success.html")
    except Exception:
        logger.exception("Failed to render success page")
        return "Internal server error", 500


@quiz_bp.post("/api/submit-quiz")
def submit_quiz():
    """Accept and save quiz data as JSON."""
    limiter = current_app.extensions["limiter"]

    @limiter.limit("5 per minute")
    def _inner_submit():
        try:
            payload = request.get_json(silent=True) or {}
            valid_data = validate_quiz_payload(payload)
            save_submission(valid_data, request)
            return jsonify({"status": "success", "message": "Заявка отправлена"}), 200
        except ValidationError as exc:
            logger.info("Validation error: %s", exc)
            return (
                jsonify({"status": "error", "message": "Ошибка валидации"}),
                400,
            )
        except CSRFError:
            logger.warning("CSRF token invalid")
            return jsonify({"status": "error", "message": "CSRF ошибка"}), 400
        except Exception:
            logger.exception("Failed to submit quiz")
            return (
                jsonify({"status": "error", "message": "Внутренняя ошибка сервера"}),
                500,
            )

    return _inner_submit()
