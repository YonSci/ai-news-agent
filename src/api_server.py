"""
Flask API Server for React Dashboard
Serves data from your AI News Agent files
"""
import sys
from collections import Counter
from threading import Lock

from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import sqlite3
from pathlib import Path
from datetime import datetime, timedelta

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config.settings import *
from src.dashboard_db import init_db

app = Flask(__name__)
CORS(app)  # Enable CORS for React dev server

init_db()

TOPIC_STOPWORDS = {
    'ai', 'news', 'company', 'release', 'releases', 'github', 'openai', 'anthropic',
    'google', 'deepmind', 'hackernews', 'hacker news', 'techcrunch ai', 'ars technica ai',
}

_hydration_lock = Lock()
_last_hydration_attempt: datetime | None = None
_NEWS_SNAPSHOT_PATH = DATA_DIR / 'news_snapshot.json'


def _get_news_row_count() -> int:
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM content_items WHERE (item_type = 'news' OR platform = 'news')")
    count = c.fetchone()[0]
    conn.close()
    return int(count or 0)


def _save_news_snapshot(items: list[dict]) -> None:
    """Persist latest collected news so cold starts can recover quickly."""
    if not items:
        return
    try:
        _NEWS_SNAPSHOT_PATH.parent.mkdir(parents=True, exist_ok=True)
        _NEWS_SNAPSHOT_PATH.write_text(json.dumps(items), encoding='utf-8')
    except Exception as exc:
        print(f"Dashboard snapshot save failed: {exc}")


def _load_news_snapshot() -> list[dict]:
    """Load previously collected news items from local snapshot."""
    try:
        if not _NEWS_SNAPSHOT_PATH.exists():
            return []
        raw = _NEWS_SNAPSHOT_PATH.read_text(encoding='utf-8')
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        return []
    except Exception as exc:
        print(f"Dashboard snapshot load failed: {exc}")
        return []


def _hydrate_news_if_empty() -> None:
    """Best-effort hydration to avoid empty dashboard after cold deploys."""
    global _last_hydration_attempt

    if _get_news_row_count() > 0:
        return

    now = datetime.now()
    if _last_hydration_attempt and (now - _last_hydration_attempt) < timedelta(minutes=1):
        return

    if not _hydration_lock.acquire(blocking=False):
        return

    _last_hydration_attempt = now
    try:
        from src.research_agent import ResearchAgent
        from src.dashboard_store import sync_news_items

        agent = ResearchAgent()
        items = agent.collect_news()
        if items:
            synced = sync_news_items(items)
            print(f"Dashboard auto-hydration saved {synced} news items")
            if synced > 0:
                _save_news_snapshot(items)
        else:
            print("Dashboard auto-hydration collected 0 items")

        if _get_news_row_count() == 0:
            snapshot_items = _load_news_snapshot()
            if snapshot_items:
                restored = sync_news_items(snapshot_items)
                print(f"Dashboard auto-hydration restored {restored} news items from snapshot")
            else:
                print("Dashboard auto-hydration snapshot fallback unavailable")
    except Exception as exc:
        print(f"Dashboard auto-hydration failed: {exc}")

        if _get_news_row_count() == 0:
            try:
                from src.dashboard_store import sync_news_items

                snapshot_items = _load_news_snapshot()
                if snapshot_items:
                    restored = sync_news_items(snapshot_items)
                    print(f"Dashboard auto-hydration recovered {restored} news items from snapshot after error")
                else:
                    print("Dashboard auto-hydration snapshot fallback unavailable after error")
            except Exception as snapshot_exc:
                print(f"Dashboard snapshot recovery failed: {snapshot_exc}")
    finally:
        _hydration_lock.release()


def _snapshot_metadata() -> dict:
    """Return snapshot diagnostics for hydration visibility."""
    exists = _NEWS_SNAPSHOT_PATH.exists()
    metadata = {
        'exists': exists,
        'path': str(_NEWS_SNAPSHOT_PATH),
        'sizeBytes': 0,
        'updatedAt': None,
    }
    if not exists:
        return metadata

    try:
        stats = _NEWS_SNAPSHOT_PATH.stat()
        metadata['sizeBytes'] = int(stats.st_size)
        metadata['updatedAt'] = datetime.fromtimestamp(stats.st_mtime).isoformat()
    except Exception as exc:
        metadata['error'] = str(exc)
    return metadata


def _parse_iso_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace('Z', '+00:00')).replace(tzinfo=None)
    except ValueError:
        return None


def _extract_topic_tokens(title: str, tags: list[str], category: str, source: str) -> set[str]:
    text = f"{title} {' '.join(tags)} {category} {source}".lower()
    tracked_terms = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'claude': 'Claude',
        'gemini': 'Gemini',
        'deepmind': 'DeepMind',
        'codex': 'Codex',
        'cursor': 'Cursor',
        'agent': 'Agents',
        'agents': 'Agents',
        'llm': 'LLM',
        'robotics': 'Robotics',
        'reasoning': 'Reasoning',
        'benchmark': 'Benchmarks',
        'model': 'Models',
        'sdk': 'SDKs',
        'release': 'Releases',
    }

    tokens = set()
    for raw_tag in tags:
        cleaned = raw_tag.replace('_', ' ').strip()
        lowered = cleaned.lower()
        if cleaned and lowered not in TOPIC_STOPWORDS and len(cleaned) > 2:
            tokens.add(cleaned.title())

    for term, label in tracked_terms.items():
        if term in text:
            tokens.add(label)

    if not tokens and category:
        tokens.add(category)

    return tokens


def _topic_category(keyword: str, fallback: str) -> str:
    key = keyword.lower()
    if key in {'openai', 'anthropic', 'claude', 'gemini', 'codex', 'llm', 'models'}:
        return 'LLM'
    if key in {'agents', 'cursor', 'sdks', 'releases'}:
        return 'Tooling'
    if key in {'robotics', 'deepmind'}:
        return 'Research'
    return fallback or 'AI News'


DEFAULT_COVERAGE_EVENTS = [
    {
        'id': 'coverage_openai_watch',
        'title': 'OpenAI release watch',
        'detail': 'Monitor product and model updates',
        'event_type': 'release_watch',
        'starts_at': '2026-01-01T10:00:00',
        'status': 'scheduled',
    },
    {
        'id': 'coverage_anthropic_checkin',
        'title': 'Anthropic and Claude check-in',
        'detail': 'Track blog posts and SDK releases',
        'event_type': 'checkin',
        'starts_at': '2026-01-02T14:30:00',
        'status': 'scheduled',
    },
    {
        'id': 'coverage_weekly_review',
        'title': 'Weekly theme review',
        'detail': 'Review tracked and important stories',
        'event_type': 'review',
        'starts_at': '2026-01-03T09:00:00',
        'status': 'scheduled',
    },
]


def _serialize_coverage_event(row: sqlite3.Row) -> dict:
    return {
        'id': row['id'],
        'title': row['title'],
        'detail': row['detail'] or '',
        'eventType': row['event_type'] or 'monitoring',
        'startsAt': row['starts_at'],
        'status': row['status'] or 'scheduled',
        'createdAt': row['created_at'],
        'updatedAt': row['updated_at'],
    }


def _seed_coverage_events_if_empty(conn: sqlite3.Connection) -> None:
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM coverage_events')
    count = c.fetchone()[0]
    if count:
        return

    now = datetime.now().isoformat()
    for event in DEFAULT_COVERAGE_EVENTS:
        c.execute(
            '''
            INSERT INTO coverage_events
            (id, title, detail, event_type, starts_at, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                event['id'],
                event['title'],
                event['detail'],
                event['event_type'],
                event['starts_at'],
                event['status'],
                now,
                now,
            ),
        )

@app.route('/api/content', methods=['GET'])
def get_content():
    """Get all content items"""
    return _serialize_items(order_by='created_at DESC')


@app.route('/api/news', methods=['GET'])
def get_news():
    """Get normalized AI news items"""
    _hydrate_news_if_empty()

    source = request.args.get('source')
    category = request.args.get('category')
    status = request.args.get('status')
    keyword = (request.args.get('q') or '').strip().lower()
    topic = (request.args.get('topic') or '').strip().lower()
    region = (request.args.get('region') or '').strip().lower()
    start_date = (request.args.get('startDate') or '').strip()
    end_date = (request.args.get('endDate') or '').strip()

    where = ["(item_type = 'news' OR platform = 'news')"]
    params = []
    if source:
        where.append('source = ?')
        params.append(source)
    if category:
        where.append('category = ?')
        params.append(category)
    if status:
        where.append('status = ?')
        params.append(status)
    if topic and topic != 'all':
        like_value = f'%{topic}%'
        where.append('(LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(category) LIKE ?)')
        params.extend([like_value, like_value, like_value, like_value])
    if keyword:
        like_value = f'%{keyword}%'
        where.append('(LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(source) LIKE ?)')
        params.extend([like_value, like_value, like_value, like_value])
    if start_date:
        where.append('published_at >= ?')
        params.append(f'{start_date}T00:00:00')
    if end_date:
        where.append('published_at <= ?')
        params.append(f'{end_date}T23:59:59')
    if region and region != 'all':
        region_label = region.replace('_', ' ')
        like_value = f'%{region_label}%'
        where.append('(LOWER(title) LIKE ? OR LOWER(summary) LIKE ? OR LOWER(tags) LIKE ? OR LOWER(source_url) LIKE ? OR LOWER(source) LIKE ?)')
        params.extend([like_value, like_value, like_value, like_value, like_value])

    where_clause = f"WHERE {' AND '.join(where)}" if where else ''
    return _serialize_items(order_by='published_at DESC, created_at DESC', where_clause=where_clause, params=params)


@app.route('/api/news/<id>/status', methods=['PATCH'])
def update_news_status(id):
    """Update tracking status for a news item."""
    data = request.json or {}
    new_status = data.get('status')

    allowed_statuses = {'new', 'tracked', 'ignored', 'important', 'archived'}
    if new_status not in allowed_statuses:
        return jsonify({'error': 'Invalid news status'}), 400

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        '''
        UPDATE content_items
        SET status = ?, updated_at = ?
        WHERE id = ?
        ''',
        (new_status, datetime.now().isoformat(), id),
    )
    conn.commit()
    conn.close()

    return jsonify({'id': id, 'status': new_status})


def _serialize_items(order_by: str, where_clause: str = '', params: list | None = None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()

    params = params or []
    c.execute(f'SELECT * FROM content_items {where_clause} ORDER BY {order_by}', params)
    rows = c.fetchall()
    
    items = []
    for row in rows:
        items.append({
            'id': row['id'],
            'title': row['title'],
            'source': row['source'],
            'sourceType': row['source_type'],
            'sourceUrl': row['source_url'],
            'viralScore': row['viral_score'],
            'relevanceScore': row['relevance_score'],
            'summary': row['summary'],
            'link': row['link'],
            'publishedAt': row['published_at'],
            'category': row['category'],
            'tags': json.loads(row['tags']) if row['tags'] else [],
            'dedupeHash': row['dedupe_hash'],
            'itemType': row['item_type'],
            'status': row['status'],
            'platform': row['platform'],
            'createdAt': row['created_at'],
            'updatedAt': row['updated_at'],
            'scriptContent': row['script_content'],
            'videoPath': row['video_path'],
            'publishedUrl': row['published_url'],
        })
    
    conn.close()
    return jsonify(items)

@app.route('/api/content', methods=['POST'])
def create_content():
    """Create new content item"""
    data = request.json
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    item_id = f"content_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    c.execute('''
        INSERT INTO content_items 
        (id, title, source, viral_score, summary, link, status, platform, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        item_id,
        data.get('title', ''),
        data.get('source', ''),
        data.get('viralScore', 5),
        data.get('summary', ''),
        data.get('link', ''),
        data.get('status', 'research'),
        data.get('platform', 'tiktok'),
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'id': item_id, 'message': 'Created'}), 201

@app.route('/api/content/<id>/status', methods=['PATCH'])
def update_status(id):
    """Update content status (for drag-and-drop)"""
    data = request.json
    new_status = data.get('status')
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    c.execute('''
        UPDATE content_items 
        SET status = ?, updated_at = ?
        WHERE id = ?
    ''', (new_status, datetime.now().isoformat(), id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'id': id, 'status': new_status})

@app.route('/api/trending', methods=['GET'])
def get_trending():
    """Build trending topics from current news items in the dashboard DB."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute(
        '''
        SELECT title, source, category, tags, published_at, relevance_score, viral_score
        FROM content_items
        WHERE item_type = 'news' OR platform = 'news'
        ORDER BY published_at DESC, created_at DESC
        '''
    )
    rows = c.fetchall()
    conn.close()

    if not rows:
        return jsonify([])

    now = datetime.now()
    aggregates: dict[str, dict] = {}

    for row in rows:
        tags = json.loads(row['tags']) if row['tags'] else []
        title = row['title'] or ''
        source = row['source'] or 'unknown'
        category = row['category'] or 'AI News'
        published_at = _parse_iso_datetime(row['published_at']) or now
        score = row['relevance_score'] or row['viral_score'] or 5
        tokens = _extract_topic_tokens(title, tags, category, source)

        for token in tokens:
            entry = aggregates.setdefault(token, {
                'count': 0,
                'recent': 0,
                'score_total': 0,
                'sources': set(),
                'related': Counter(),
                'category': category,
                'lastUpdated': published_at.isoformat(),
            })
            entry['count'] += 1
            entry['score_total'] += score
            entry['sources'].add(source)
            entry['category'] = _topic_category(token, entry['category'])
            if published_at >= now - timedelta(days=1):
                entry['recent'] += 1
            if published_at.isoformat() > entry['lastUpdated']:
                entry['lastUpdated'] = published_at.isoformat()

            for related in tokens:
                if related != token:
                    entry['related'][related] += 1

    topics = []
    for keyword, entry in aggregates.items():
        previous = max(entry['count'] - entry['recent'], 0)
        if previous > 0:
            growth = round(((entry['recent'] - previous) / previous) * 100)
        else:
            growth = min(200, entry['recent'] * 25)

        avg_score = entry['score_total'] / max(entry['count'], 1)
        sentiment = 'positive' if avg_score >= 8 else 'neutral' if avg_score >= 6 else 'negative'
        volume = int(entry['count'] * 120 + avg_score * 25)

        topics.append({
            'id': f"topic_{keyword.lower().replace(' ', '_')}",
            'keyword': keyword,
            'category': entry['category'],
            'volume': volume,
            'growth': growth,
            'sentiment': sentiment,
            'sources': sorted(entry['sources']),
            'relatedTopics': [name for name, _ in entry['related'].most_common(3)],
            'lastUpdated': entry['lastUpdated'],
        })

    topics.sort(key=lambda item: (item['volume'], item['growth']), reverse=True)
    return jsonify(topics[:15])


@app.route('/api/coverage/events', methods=['GET'])
def get_coverage_events():
    """Get coverage calendar events for monitoring and review planning."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    _seed_coverage_events_if_empty(conn)

    c = conn.cursor()
    c.execute('SELECT * FROM coverage_events ORDER BY starts_at ASC, created_at ASC')
    rows = c.fetchall()
    conn.commit()
    conn.close()

    return jsonify([_serialize_coverage_event(row) for row in rows])


@app.route('/api/coverage/events', methods=['POST'])
def create_coverage_event():
    """Create a new coverage calendar event."""
    data = request.json or {}
    title = (data.get('title') or '').strip()
    starts_at = (data.get('startsAt') or '').strip()
    detail = (data.get('detail') or '').strip()
    event_type = (data.get('eventType') or 'monitoring').strip()
    status = (data.get('status') or 'scheduled').strip()

    if not title or not starts_at:
        return jsonify({'error': 'title and startsAt are required'}), 400

    event_id = f"coverage_{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
    now = datetime.now().isoformat()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        '''
        INSERT INTO coverage_events
        (id, title, detail, event_type, starts_at, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''',
        (event_id, title, detail, event_type, starts_at, status, now, now),
    )
    conn.commit()
    conn.close()

    return jsonify({'id': event_id, 'message': 'created'}), 201


@app.route('/api/coverage/events/<id>', methods=['PATCH'])
def update_coverage_event(id):
    """Update an existing coverage event."""
    data = request.json or {}

    allowed_updates = {
        'title': 'title',
        'detail': 'detail',
        'eventType': 'event_type',
        'startsAt': 'starts_at',
        'status': 'status',
    }

    sets = []
    values = []
    for payload_key, db_column in allowed_updates.items():
        if payload_key in data:
            sets.append(f"{db_column} = ?")
            values.append(data[payload_key])

    if not sets:
        return jsonify({'error': 'No valid fields to update'}), 400

    sets.append('updated_at = ?')
    values.append(datetime.now().isoformat())
    values.append(id)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(f"UPDATE coverage_events SET {', '.join(sets)} WHERE id = ?", values)
    conn.commit()
    conn.close()

    return jsonify({'id': id, 'message': 'updated'})


@app.route('/api/coverage/events/<id>', methods=['DELETE'])
def delete_coverage_event(id):
    """Delete a coverage event."""
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM coverage_events WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'id': id, 'message': 'deleted'})

@app.route('/api/projects', methods=['GET'])
def get_projects():
    """Get all projects"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM projects ORDER BY start_date DESC, id DESC')
    rows = c.fetchall()
    
    projects = []
    for row in rows:
        # Get tasks for project
        c.execute('SELECT * FROM tasks WHERE project_id = ?', (row['id'],))
        task_rows = c.fetchall()
        
        tasks = [{
            'id': t['id'],
            'title': t['title'],
            'completed': bool(t['completed']),
            'assignee': t['assignee'],
            'dueDate': t['due_date']
        } for t in task_rows]
        
        projects.append({
            'id': row['id'],
            'name': row['name'],
            'description': row['description'],
            'status': row['status'],
            'priority': row['priority'],
            'progress': row['progress'],
            'startDate': row['start_date'],
            'dueDate': row['due_date'],
            'tasks': tasks,
            'tags': json.loads(row['tags']) if row['tags'] else []
        })
    
    conn.close()
    return jsonify(projects)

@app.route('/api/stats/dashboard', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics"""
    _hydrate_news_if_empty()

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    news_where = "WHERE (item_type = 'news' OR platform = 'news')"

    c.execute(f'SELECT COUNT(*) FROM content_items {news_where}')
    total_stories = c.fetchone()[0]

    day_ago = (datetime.now() - timedelta(days=1)).isoformat()
    c.execute(
        f'SELECT COUNT(*) FROM content_items {news_where} AND published_at >= ?',
        (day_ago,),
    )
    new_today = c.fetchone()[0]

    c.execute(f'SELECT AVG(COALESCE(relevance_score, viral_score)) FROM content_items {news_where}')
    avg_relevance = round(c.fetchone()[0] or 0, 1)

    c.execute(f"SELECT COUNT(*) FROM content_items {news_where} AND status = 'tracked'")
    tracked = c.fetchone()[0]

    c.execute(f"SELECT COUNT(*) FROM content_items {news_where} AND status = 'important'")
    important = c.fetchone()[0]

    c.execute(f"SELECT COUNT(*) FROM content_items {news_where} AND status = 'ignored'")
    ignored = c.fetchone()[0]
    
    conn.close()

    return jsonify({
        'totalStories': total_stories,
        'newToday': new_today,
        'avgRelevanceScore': avg_relevance,
        'trackedCount': tracked,
        'importantCount': important,
        'ignoredCount': ignored,
    })


@app.route('/api/health/hydration', methods=['GET'])
def get_hydration_health():
    """Expose hydration and snapshot state for production diagnostics."""
    news_count = _get_news_row_count()
    snapshot = _snapshot_metadata()

    state = 'ok'
    if news_count == 0:
        state = 'empty'
    if news_count == 0 and not snapshot.get('exists'):
        state = 'critical'

    return jsonify({
        'state': state,
        'newsRowCount': news_count,
        'lastHydrationAttempt': _last_hydration_attempt.isoformat() if _last_hydration_attempt else None,
        'snapshot': snapshot,
        'dbPath': str(DB_PATH),
        'timestamp': datetime.now().isoformat(),
    })

@app.route('/api/stats/performance', methods=['GET'])
def get_performance():
    """Get performance data for charts"""
    days = request.args.get('days', 30, type=int)
    
    # Mock data - in production, fetch from YouTube Analytics API
    daily = [
        {'date': 'Mon', 'views': 1200, 'likes': 340, 'shares': 120},
        {'date': 'Tue', 'views': 1900, 'likes': 520, 'shares': 200},
        {'date': 'Wed', 'views': 2400, 'likes': 680, 'shares': 280},
        {'date': 'Thu', 'views': 1800, 'likes': 450, 'shares': 150},
        {'date': 'Fri', 'views': 3200, 'likes': 890, 'shares': 420},
        {'date': 'Sat', 'views': 4100, 'likes': 1200, 'shares': 580},
        {'date': 'Sun', 'views': 3800, 'likes': 1100, 'shares': 490},
    ]
    
    return jsonify({'daily': daily})

if __name__ == '__main__':
    print("Starting AI News Agent API Server...")
    print(f"Dashboard DB: {DB_PATH}")
    app.run(debug=True, port=5000)