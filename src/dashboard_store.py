"""Helpers to persist real pipeline data into the dashboard SQLite store."""

import hashlib
import sqlite3
from datetime import datetime
from typing import Dict, Iterable

from config.settings import DB_PATH
from src.dashboard_db import init_db


def sync_research_stories(stories: Iterable[Dict]) -> int:
    """Replace dashboard content with latest research stories."""
    init_db()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("DELETE FROM content_items")

    count = 0
    now = datetime.now().isoformat()
    for story in stories:
        title = (story.get('title') or '').strip()
        if not title:
            continue

        link = (story.get('link') or '').strip()
        stable_key = link or title.lower()
        item_id = f"content_{hashlib.sha1(stable_key.encode('utf-8')).hexdigest()[:12]}"

        c.execute(
            '''
            INSERT INTO content_items
            (id, title, source, viral_score, summary, link, status, platform, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                item_id,
                title,
                story.get('source', 'unknown'),
                int(story.get('viral_score', 5) or 5),
                (story.get('summary') or '')[:500],
                link,
                'research',
                'tiktok',
                now,
                now,
            ),
        )
        count += 1

    conn.commit()
    conn.close()
    return count
