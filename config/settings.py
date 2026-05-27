"""
AI News Agent - Configuration
Windows-compatible paths using pathlib
"""
import os
from pathlib import Path


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

# Base directory (project root)
BASE_DIR = Path(__file__).parent.parent

# Data directories
DATA_DIR = BASE_DIR / "data"
BRIEFS_DIR = DATA_DIR / "briefs"
DRAFTS_DIR = DATA_DIR / "drafts"
APPROVED_DIR = DATA_DIR / "approved"
POSTED_DIR = DATA_DIR / "posted"
ASSETS_DIR = DATA_DIR / "assets"
DB_PATH = DATA_DIR / "dashboard.db"

# Logs
LOGS_DIR = BASE_DIR / "logs"

# Ensure all directories exist
for directory in [BRIEFS_DIR, DRAFTS_DIR, APPROVED_DIR, POSTED_DIR, ASSETS_DIR, LOGS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# Reddit API (free tier)
REDDIT_CLIENT_ID = os.getenv("REDDIT_CLIENT_ID", "")
REDDIT_CLIENT_SECRET = os.getenv("REDDIT_CLIENT_SECRET", "")
REDDIT_USER_AGENT = "AI-News-Agent/1.0 by YourUsername"

# YouTube API
YOUTUBE_CLIENT_SECRETS_FILE = BASE_DIR / "config" / "client_secrets.json"

# TikTok API
TIKTOK_AUTO_UPLOAD = _env_bool("TIKTOK_AUTO_UPLOAD", default=False)
TIKTOK_ACCESS_TOKEN = os.getenv("TIKTOK_ACCESS_TOKEN", "")
TIKTOK_API_BASE_URL = os.getenv("TIKTOK_API_BASE_URL", "https://open.tiktokapis.com")
TIKTOK_PRIVACY_LEVEL = os.getenv("TIKTOK_PRIVACY_LEVEL", "SELF_ONLY")
TIKTOK_DISABLE_COMMENT = _env_bool("TIKTOK_DISABLE_COMMENT", default=False)
TIKTOK_DISABLE_DUET = _env_bool("TIKTOK_DISABLE_DUET", default=False)
TIKTOK_DISABLE_STITCH = _env_bool("TIKTOK_DISABLE_STITCH", default=False)

# Content Settings
MAX_STORIES_PER_DAY = 5
TARGET_VIDEO_LENGTH = 45  # seconds
BRAND_NAME = "AI Daily"

# Video resolution (9:16 for Shorts/TikTok)
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 24