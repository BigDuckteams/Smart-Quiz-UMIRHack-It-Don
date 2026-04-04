"""Quiz submission routes."""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
from functools import wraps
from typing import Any

from flask import Blueprint, current_app, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from marshmallow import ValidationError

from services.submission_service import SubmissionService
from utils.validators import parse_and_validate_payload

quiz_bp = Blueprint('quiz_routes', __name__)
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)
submission_service: SubmissionService | None = None
RECENT_SUBMITS: dict[str, float] = {}


def _token_serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(current_app.config['SECRET_KEY'], salt='smart-quiz-admin')


def _create_admin_token(username: str) -> str:
    return _token_serializer().dumps({'username': username})


def _verify_admin_token(token: str) -> dict[str, Any] | None:
    try:
        return _token_serializer().loads(token, max_age=current_app.config['ADMIN_TOKEN_TTL_SECONDS'])
    except (BadSignature, SignatureExpired):
        return None


def get_submission_service() -> SubmissionService:
    global submission_service
    if submission_service is None:
        submission_service = SubmissionService(current_app.config['SQLITE_PATH'])
    return submission_service


def _is_duplicate(payload: dict[str, Any], ttl_seconds: int) -> bool:
    now = time.time()
    for key, seen_at in list(RECENT_SUBMITS.items()):
        if now - seen_at > ttl_seconds:
            RECENT_SUBMITS.pop(key, None)

    fingerprint = hashlib.sha256(
        json.dumps(
            {
                'phone': payload.get('phone', ''),
                'area': payload.get('area'),
                'room_type': payload.get('room_type'),
            },
            sort_keys=True,
            ensure_ascii=False,
        ).encode('utf-8')
    ).hexdigest()

    if fingerprint in RECENT_SUBMITS:
        return True

    RECENT_SUBMITS[fingerprint] = now
    return False


def _require_admin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        token = request.headers.get('Authorization', '').removeprefix('Bearer ').strip()
        data = _verify_admin_token(token)
        if not token or not data:
            return jsonify({'success': False, 'message': 'Не авторизован'}), 401
        return view(*args, **kwargs)

    return wrapped


@quiz_bp.post('/api/admin/login')
@limiter.limit('10 per minute')
def admin_login():
    payload = request.get_json(silent=True) or {}
    username = str(payload.get('username', '')).strip()
    password = str(payload.get('password', '')).strip()

    valid_username = hmac.compare_digest(username, current_app.config['ADMIN_USERNAME'])
    valid_password = hmac.compare_digest(password, current_app.config['ADMIN_PASSWORD'])

    if valid_username and valid_password:
        token = _create_admin_token(current_app.config['ADMIN_USERNAME'])
        return jsonify(
            {
                'success': True,
                'token': token,
                'expires_in': current_app.config['ADMIN_TOKEN_TTL_SECONDS'],
                'admin': {'username': current_app.config['ADMIN_USERNAME']},
            }
        )

    return jsonify({'success': False, 'message': 'Неверные данные входа'}), 401


@quiz_bp.post('/api/admin/logout')
@_require_admin
def admin_logout():
    return jsonify({'success': True})


@quiz_bp.get('/api/admin/me')
@_require_admin
def admin_me():
    return jsonify({'success': True, 'admin': {'username': current_app.config['ADMIN_USERNAME']}})


@quiz_bp.post('/api/quiz/submit')
@limiter.limit(lambda: current_app.config['RATE_LIMIT'])
def submit_quiz():
    try:
        raw_payload = request.get_json(silent=True) or {}
        payload = parse_and_validate_payload(raw_payload, current_app.config)

        if payload.get('consent') is not True:
            raise ValidationError('Consent required')

        if _is_duplicate(payload, current_app.config['DUPLICATE_WINDOW_SECONDS']):
            logger.warning('duplicate_submit_blocked', extra={'ip': get_remote_address()})
            return jsonify({'success': False, 'message': 'Не удалось отправить заявку'}), 409

        get_submission_service().save(payload)
        return jsonify({'success': True, 'message': 'Заявка успешно отправлена'}), 200

    except ValidationError:
        logger.info('validation_error', extra={'ip': get_remote_address()})
        return jsonify({'success': False, 'message': 'Не удалось отправить заявку'}), 400
    except Exception:
        logger.exception('quiz_submit_error')
        return jsonify({'success': False, 'message': 'Не удалось отправить заявку'}), 500


@quiz_bp.get('/api/quiz/submissions')
@_require_admin
def list_submissions():
    filters = {
        'name': request.args.get('name', ''),
        'phone': request.args.get('phone', ''),
        'email': request.args.get('email', ''),
        'query': request.args.get('query', ''),
        'date_from': request.args.get('date_from', ''),
        'date_to': request.args.get('date_to', ''),
    }
    limit = min(int(request.args.get('limit', 100)), 300)
    data = get_submission_service().list_submissions(filters=filters, limit=limit)
    return jsonify({'success': True, 'data': data})


@quiz_bp.get('/api/quiz/analytics')
@_require_admin
def analytics():
    data = get_submission_service().analytics()
    return jsonify({'success': True, 'data': data})
