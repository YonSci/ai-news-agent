"""Helpers to persist real pipeline data into the dashboard SQLite store."""

import hashlib
import json
import sqlite3
from datetime import datetime
from typing import Dict, Iterable

from config.settings import DB_PATH
from src.dashboard_db import init_db


def sync_news_items(items: Iterable[Dict]) -> int:
    """Replace dashboard content with the latest normalized news items."""
    init_db()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("DELETE FROM content_items")

    count = 0
    now = datetime.now().isoformat()
    for item in items:
        title = (item.get('title') or '').strip()
        if not title:
            continue

        link = (item.get('url') or item.get('link') or '').strip()
        stable_key = item.get('dedupe_hash') or link or title.lower()
        item_id = f"news_{hashlib.sha1(stable_key.encode('utf-8')).hexdigest()[:12]}"

        c.execute(
            '''
            INSERT INTO content_items
            (id, title, source, source_type, source_url, viral_score, relevance_score, summary, link,
             published_at, category, tags, dedupe_hash, item_type, status, platform, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                item_id,
                title,
                item.get('source', 'unknown'),
                item.get('source_type', 'rss'),
                item.get('source_url', link),
                int(item.get('viral_score', item.get('relevance_score', 5)) or 5),
                int(item.get('relevance_score', item.get('viral_score', 5)) or 5),
                (item.get('summary') or '')[:800],
                link,
                item.get('published_at') or now,
                item.get('category') or 'AI News',
                json.dumps(item.get('tags', [])),
                item.get('dedupe_hash') or stable_key,
                item.get('item_type', 'news'),
                item.get('status', 'new'),
                item.get('platform', 'news'),
                now,
                now,
            ),
        )
        count += 1

    conn.commit()
    conn.close()
    return count


def sync_research_stories(stories: Iterable[Dict]) -> int:
    """Backward-compatible wrapper for the existing research flow."""
    return sync_news_items(stories)
