"""
Flask API Server for React Dashboard
Serves data from your AI News Agent files
"""
import sys

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

@app.route('/api/content', methods=['GET'])
def get_content():
    """Get all content items"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    c.execute('SELECT * FROM content_items ORDER BY created_at DESC')
    rows = c.fetchall()
    
    items = []
    for row in rows:
        items.append({
            'id': row['id'],
            'title': row['title'],
            'source': row['source'],
            'viralScore': row['viral_score'],
            'summary': row['summary'],
            'link': row['link'],
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
    """Get trending topics from latest brief"""
    briefs = sorted(BRIEFS_DIR.glob("*-brief.md"))
    
    if not briefs:
        # Return mock data if no briefs
        return jsonify([
            {
                'id': '1',
                'keyword': 'GPT-5',
                'category': 'LLM',
                'volume': 45000,
                'growth': 120,
                'sentiment': 'positive',
                'sources': ['reddit', 'hackernews'],
                'relatedTopics': ['OpenAI', 'AGI'],
                'lastUpdated': datetime.now().isoformat()
            },
            {
                'id': '2',
                'keyword': 'AI Video Generation',
                'category': 'Multimodal',
                'volume': 32000,
                'growth': 85,
                'sentiment': 'positive',
                'sources': ['arxiv', 'twitter'],
                'relatedTopics': ['Sora', 'Runway'],
                'lastUpdated': datetime.now().isoformat()
            }
        ])
    
    # Parse latest brief
    latest = briefs[-1].read_text(encoding='utf-8')
    
    # Simple parsing - in production, use proper markdown parser
    topics = []
    # ... parse logic here ...
    
    return jsonify(topics)

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
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Total content
    c.execute('SELECT COUNT(*) FROM content_items')
    total = c.fetchone()[0]
    
    # Published this week
    week_ago = (datetime.now() - timedelta(days=7)).isoformat()
    c.execute('SELECT COUNT(*) FROM content_items WHERE status = ? AND created_at > ?', 
              ('published', week_ago))
    published_week = c.fetchone()[0]
    
    # Average viral score
    c.execute('SELECT AVG(viral_score) FROM content_items')
    avg_viral = round(c.fetchone()[0] or 0, 1)
    
    # Pending review
    c.execute('SELECT COUNT(*) FROM content_items WHERE status = ?', ('review',))
    pending = c.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'totalContent': total,
        'publishedThisWeek': published_week,
        'avgViralScore': avg_viral,
        'topPlatform': 'tiktok',
        'pendingReview': pending,
        'successRate': 85
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