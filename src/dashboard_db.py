"""Shared SQLite schema helpers for the dashboard data store."""

import sqlite3

from config.settings import DB_PATH


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''
        CREATE TABLE IF NOT EXISTS content_items (
            id TEXT PRIMARY KEY,
            title TEXT,
            source TEXT,
            viral_score INTEGER,
            summary TEXT,
            link TEXT,
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

    conn.commit()
    conn.close()