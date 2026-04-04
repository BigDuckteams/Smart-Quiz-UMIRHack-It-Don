"""Input validation helpers."""

from __future__ import annotations

import re
from typing import Any

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_RE = re.compile(r"^[+()\-\s\d]{7,25}$")


class ValidationError(ValueError):
    """Raised when payload validation fails."""


def _clean_string(value: Any) -> str:
    """Convert value to stripped string safely."""
    if value is None:
        return ""
    return str(value).strip()


def validate_quiz_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """Validate and normalize quiz payload from API request."""
    room_type = _clean_string(payload.get("room_type"))
    zones_raw = payload.get("zones", [])
    style = _clean_string(payload.get("style"))
    budget = _clean_string(payload.get("budget"))
    name = _clean_string(payload.get("name"))
    phone = _clean_string(payload.get("phone"))
    email = _clean_string(payload.get("email"))
    comment = _clean_string(payload.get("comment"))
    consent = bool(payload.get("consent"))

    if not room_type:
        raise ValidationError("Укажите тип помещения")

    if not isinstance(zones_raw, list):
        raise ValidationError("Некорректный формат зон")

    zones = [_clean_string(zone) for zone in zones_raw if _clean_string(zone)]
    if len(zones) < 1:
        raise ValidationError("Выберите минимум одну зону")

    try:
        area = int(payload.get("area", 0))
    except (TypeError, ValueError) as exc:
        raise ValidationError("Площадь должна быть числом") from exc

    if area < 20 or area > 300:
        raise ValidationError("Площадь должна быть в диапазоне 20–300")

    if not style:
        raise ValidationError("Укажите стиль")

    if not budget:
        raise ValidationError("Укажите бюджет")

    if not phone:
        raise ValidationError("Телефон обязателен")

    if not PHONE_RE.match(phone):
        raise ValidationError("Некорректный формат телефона")

    if email and not EMAIL_RE.match(email):
        raise ValidationError("Некорректный формат email")

    if not consent:
        raise ValidationError("Необходимо согласие на обработку данных")

    return {
        "room_type": room_type,
        "zones": zones,
        "area": area,
        "style": style,
        "budget": budget,
        "name": name,
        "phone": phone,
        "email": email,
        "comment": comment,
        "consent": consent,
    }
