"""Shared SQLite schema helpers for the dashboard data store."""

import sqlite3

from config.settings import DB_PATH


def _ensure_columns(conn: sqlite3.Connection, table_name: str, columns: dict[str, str]) -> None:
    existing = {row[1] for row in conn.execute(f"PRAGMA table_info({table_name})").fetchall()}
    for column_name, column_type in columns.items():
        if column_name not in existing:
            conn.execute(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS content_items (
            id TEXT PRIMARY KEY,
            title TEXT,
            source TEXT,
            source_type TEXT,
            source_url TEXT,
            viral_score INTEGER,
            relevance_score INTEGER,
            summary TEXT,
            link TEXT,
            published_at TEXT,
            category TEXT,
            tags TEXT,
            dedupe_hash TEXT,
            item_type TEXT,
            status TEXT,
            platform TEXT,
            created_at TEXT,
            updated_at TEXT,
            script_content TEXT,
            video_path TEXT,
            published_url TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            status TEXT,
            priority TEXT,
            progress INTEGER,
            start_date TEXT,
            due_date TEXT,
            tags TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            project_id TEXT,
            title TEXT,
            completed INTEGER,
            assignee TEXT,
            due_date TEXT
        )
    ''')

    c.execute('''
        CREATE TABLE IF NOT EXISTS coverage_events (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            detail TEXT,
            event_type TEXT,
            starts_at TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT,
            updated_at TEXT
        )
    ''')

    _ensure_columns(
        conn,
        'content_items',
        {
            'source_type': 'TEXT',
            'source_url': 'TEXT',
            'relevance_score': 'INTEGER',
            'published_at': 'TEXT',
            'category': 'TEXT',
            'tags': 'TEXT',
            'dedupe_hash': 'TEXT',
            'item_type': 'TEXT',
        },
    )

    conn.commit()
    conn.close()