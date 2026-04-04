"""Smart Quiz Flask application entrypoint."""

from __future__ import annotations

import logging
import os

from flask import Flask, jsonify

from config import config_by_name
from database.models import db
from routes.quiz_routes import quiz_bp
from utils.security import csrf, init_limiter, set_security_headers


def create_app() -> Flask:
    """Create and configure Flask application instance."""
    env = os.getenv("FLASK_ENV", "default")
    app = Flask(__name__, template_folder="templates", static_folder="static")
    app.config.from_object(config_by_name.get(env, config_by_name["default"]))

    if not app.config.get("SECRET_KEY"):
        raise RuntimeError("SECRET_KEY must be set via environment variable")

    logging.basicConfig(level=logging.INFO)

    db.init_app(app)
    csrf.init_app(app)
    limiter = init_limiter(app)

    app.register_blueprint(quiz_bp)

    @app.after_request
    def apply_security_headers(response):
        return set_security_headers(response)

    @app.errorhandler(429)
    def ratelimit_handler(_error):
        return jsonify({"status": "error", "message": "Слишком много запросов"}), 429

    with app.app_context():
        db.create_all()

    # attach for runtime visibility/testing
    app.extensions["limiter"] = limiter

    return app


app = create_app()
