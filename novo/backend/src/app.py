import os

from dotenv import load_dotenv
from flask import Flask, jsonify

from src.config.database import get_connection
from src.routes.exercises import exercises_bp
from src.routes.users import users_bp
from src.routes.progress import progress_bp

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.register_blueprint(users_bp)
    app.register_blueprint(exercises_bp)
    app.register_blueprint(progress_bp)

    @app.after_request
    def add_cors_headers(response):
        origin = os.getenv("FRONTEND_ORIGIN", "*")
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
        return response

    @app.get("/api/health")
    def health():
        try:
            connection = get_connection()
            connection.close()
            return jsonify({"status": "ok", "database": "connected"})
        except Exception:
            return jsonify({"status": "error", "database": "unavailable"}), 503

    @app.get("/")
    def index():
        return jsonify({"name": "AOLDEYA Fitness API", "status": "running"})

    return app
