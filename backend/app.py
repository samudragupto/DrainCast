"""DrainCast backend — Flask + NetworkX reference API.

This service is intentionally NOT called by the React frontend: the demo
runs fully client-side so it can be presented offline with zero setup.
The backend exists to demonstrate the production full-stack architecture
(see docs/BACKEND_ARCHITECTURE.md).

Run:
    python -m venv venv && source venv/bin/activate
    pip install -r requirements.txt
    python app.py            # → http://localhost:5000/api/health
"""

from flask import Flask, jsonify
from flask_cors import CORS

from api import api_bp
from api.routes_terrain import ward_bp
from config import Config


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    app.register_blueprint(api_bp)
    app.register_blueprint(ward_bp, url_prefix="/api/ward")

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "ok": True,
                "service": "draincast-backend",
                "version": "1.0.0",
                "status": "healthy",
            }
        )

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"ok": False, "error": "endpoint not found"}), 404

    @app.errorhandler(500)
    def server_error(_):
        return jsonify({"ok": False, "error": "internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
