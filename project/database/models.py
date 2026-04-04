"""Database models for Smart Quiz."""

from __future__ import annotations

from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class QuizSubmission(db.Model):
    """Stores quiz submissions from users."""

    id = db.Column(db.Integer, primary_key=True)
    room_type = db.Column(db.String(100), nullable=False)
    zones = db.Column(db.Text, nullable=False)
    area = db.Column(db.Integer, nullable=False)
    style = db.Column(db.String(120), nullable=False)
    budget = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(120), nullable=True)
    phone = db.Column(db.String(40), nullable=False)
    email = db.Column(db.String(254), nullable=True)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.String(255), nullable=True)
    page_url = db.Column(db.String(255), nullable=True)
    utm_source = db.Column(db.String(120), nullable=True)
