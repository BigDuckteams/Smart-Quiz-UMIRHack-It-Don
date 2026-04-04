"""Business logic for quiz submissions."""

from __future__ import annotations

from flask import Request

from database.models import QuizSubmission, db


def save_submission(valid_data: dict, request: Request) -> QuizSubmission:
    """Persist validated quiz submission to the database."""
    submission = QuizSubmission(
        room_type=valid_data["room_type"],
        zones=", ".join(valid_data["zones"]),
        area=valid_data["area"],
        style=valid_data["style"],
        budget=valid_data["budget"],
        name=valid_data["name"],
        phone=valid_data["phone"],
        email=valid_data["email"],
        comment=valid_data["comment"],
        ip_address=request.remote_addr or "unknown",
        user_agent=(request.user_agent.string[:255] if request.user_agent else ""),
        page_url=(request.referrer or "")[:255],
        utm_source=(request.args.get("utm_source", "") or "")[:120],
    )
    db.session.add(submission)
    db.session.commit()
    return submission
