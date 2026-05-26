"""
AI News Agent - Configuration
Windows-compatible paths using pathlib
"""
import os
from pathlib import Path

# Base directory (project root)
BASE_DIR = Path(__file__).parent.parent

# Data directories
DATA_DIR = BASE_DIR / "data"
BRIEFS_DIR = DATA_DIR / "briefs"
DRAFTS_DIR = DATA_DIR / "drafts"
APPROVED_DIR = DATA_DIR / "approved"
POSTED_DIR = DATA_DIR / "posted"
ASSETS_DIR = DATA_DIR / "assets"

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

# Content Settings
MAX_STORIES_PER_DAY = 5
TARGET_VIDEO_LENGTH = 45  # seconds
BRAND_NAME = "AI Daily"

# Video resolution (9:16 for Shorts/TikTok)
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 24