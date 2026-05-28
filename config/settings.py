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

# GitHub API (optional; improves rate limits)
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

# Content Settings
MAX_STORIES_PER_DAY = 5
TARGET_VIDEO_LENGTH = 45  # seconds
BRAND_NAME = "AI Daily"

# News dashboard sources (all free / public)
NEWS_RSS_FEEDS = {
    "openai": "https://openai.com/index/rss.xml",
    "anthropic": "https://www.anthropic.com/news/rss.xml",
    "google_deepmind": "https://deepmind.google/discover/blog/rss.xml",
    "google_ai_blog": "https://blog.google/technology/ai/rss/",
    "nvidia_blog": "https://blogs.nvidia.com/feed/",
    "nvidia_developer_blog": "https://developer.nvidia.com/blog/feed/",
    "techcrunch_ai": "https://techcrunch.com/tag/artificial-intelligence/feed/",
    "ars_technica_ai": "https://arstechnica.com/tag/artificial-intelligence/feed/",
}

NEWS_COMPANY_PAGES = {
    "openai": "https://openai.com/news/",
    "anthropic": "https://www.anthropic.com/news",
    "google_deepmind": "https://deepmind.google/discover/blog/",
    "google_ai_blog": "https://blog.google/technology/ai/",
    "nvidia_blog": "https://blogs.nvidia.com/blog/category/ai/",
    "nvidia_developer_blog": "https://developer.nvidia.com/blog/",
}

NEWS_HN_KEYWORDS = [
    "ai",
    "artificial intelligence",
    "llm",
    "openai",
    "anthropic",
    "deepmind",
    "nvidia",
    "tensorrt",
    "nemo",
    "claude",
    "codex",
    "cursor",
    "machine learning",
]

NEWS_GITHUB_RELEASE_QUERIES = [
    {"label": "Claude Code", "query": "claude code in:name,description"},
    {"label": "OpenAI Codex", "query": "codex openai in:name,description"},
    {"label": "Cursor", "query": "cursor ai in:name,description"},
    {"label": "Google DeepMind", "query": "google deepmind ai in:name,description"},
    {"label": "NVIDIA AI", "query": "nvidia ai in:name,description"},
    {"label": "AI Coding Tools", "query": "ai coding in:name,description"},
]

NEWS_GITHUB_RELEASE_FEEDS = {
    "OpenAI Python": "https://github.com/openai/openai-python/releases.atom",
    "Anthropic SDK": "https://github.com/anthropics/anthropic-sdk-python/releases.atom",
    "Google Gen AI": "https://github.com/googleapis/python-genai/releases.atom",
    "Google DeepMind AlphaFold": "https://github.com/google-deepmind/alphafold/releases.atom",
    "NVIDIA TensorRT": "https://github.com/NVIDIA/TensorRT/releases.atom",
    "NVIDIA NeMo": "https://github.com/NVIDIA/NeMo/releases.atom",
    "Hugging Face Transformers": "https://github.com/huggingface/transformers/releases.atom",
    "Microsoft AutoGen": "https://github.com/microsoft/autogen/releases.atom",
}

NEWS_MAX_PER_SOURCE = 10

# Video resolution (9:16 for Shorts/TikTok)
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
FPS = 24