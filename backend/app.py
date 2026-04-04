"""Flask app entrypoint for Smart Quiz backend."""

from __future__ import annotations

import logging

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.quiz_routes import limiter, quiz_bp


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)

    logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s [%(name)s] %(message)s')

    CORS(
        app,
        resources={r'/api/*': {'origins': [app.config['FRONTEND_ORIGIN']]}},
        supports_credentials=False,
        methods=['GET', 'POST', 'OPTIONS'],
        allow_headers=['Content-Type', 'Authorization'],
    )

    limiter.init_app(app)
    app.register_blueprint(quiz_bp)

    @app.after_request
    def set_secure_headers(response):
        response.headers['Content-Security-Policy'] = "default-src 'self'; frame-ancestors 'none'; base-uri 'self';"
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        return response

    @app.errorhandler(429)
    def handle_429(_error):
        return jsonify({'success': False, 'message': 'Не удалось отправить заявку'}), 429

    @app.errorhandler(404)
    def handle_404(_error):
        return jsonify({'success': False, 'message': 'Не удалось отправить заявку'}), 404

    @app.errorhandler(Exception)
    def handle_exception(error):
        logging.getLogger(__name__).exception('unhandled_exception', exc_info=error)
        return jsonify({'success': False, 'message': 'Не удалось отправить заявку'}), 500

    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
