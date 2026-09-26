"""DrainCast backend configuration."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DRAINCAST_DATA_DIR", BASE_DIR / "data"))


class Config:
    """Flask configuration (kept intentionally small — this is a demo API)."""

    DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"
    HOST = os.getenv("FLASK_HOST", "0.0.0.0")
    PORT = int(os.getenv("FLASK_PORT", "5000"))

    # CORS is enabled for presentation convenience. The React frontend does
    # NOT call this API — it runs fully client-side — but a future production
    # deployment would point the same origins at this service.
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = False
