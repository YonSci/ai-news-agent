"""Seed demo data for dashboard development"""
import sqlite3
import json
from datetime import datetime, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import DB_PATH
from src.dashboard_db import init_db

def seed():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Clear existing
    c.execute("DELETE FROM content_items")
    c.execute("DELETE FROM projects")
    c.execute("DELETE FROM tasks")
    
    # Seed content items across all statuses
    contents = [
        {
            'id': 'content_001',
            'title': 'GPT-5 Rumors: What We Know',
            'source': 'reddit_MachineLearning',
            'viral_score': 9,
            'summary': 'OpenAI reportedly testing next-gen model with 10x parameters',
            'link': 'https://reddit.com/r/ml',
            'status': 'research',
            'platform': 'tiktok',
            'created_at': (datetime.now() - timedelta(hours=2)).isoformat(),
        },
        {
            'id': 'content_002',
            'title': 'AI Video Just Got 10x Faster',
            'source': 'arxiv',
            'viral_score': 8,
            'summary': 'New diffusion model generates 4K video in real-time',
            'link': 'https://arxiv.org/abs/1234',
            'status': 'scripting',
            'platform': 'youtube_short',
            'created_at': (datetime.now() - timedelta(hours=5)).isoformat(),
        },
        {
            'id': 'content_003',
            'title': 'DeepSeek vs ChatGPT: Honest Test',
            'source': 'hackernews',
            'viral_score': 7,
            'summary': 'Side-by-side comparison reveals surprising weaknesses',
            'link': 'https://news.ycombinator.com',
            'status': 'review',
            'platform': 'tiktok',
            'created_at': (datetime.now() - timedelta(days=1)).isoformat(),
        },
        {
            'id': 'content_004',
            'title': 'Free AI Tools You Missed',
            'source': 'reddit_artificial',
            'viral_score': 6,
            'summary': '5 open-source alternatives to paid AI services',
            'link': 'https://reddit.com/r/ai',
            'status': 'production',
            'platform': 'youtube_short',
            'created_at': (datetime.now() - timedelta(days=2)).isoformat(),
        },
        {
            'id': 'content_005',
            'title': 'AI Replaced My Intern',
            'source': 'hackernews',
            'viral_score': 9,
            'summary': 'Startup CEO shares 3-month automation journey',
            'link': 'https://news.ycombinator.com',
            'status': 'approved',
            'platform': 'tiktok',
            'created_at': (datetime.now() - timedelta(days=3)).isoformat(),
        },
        {
            'id': 'content_006',
            'title': 'New LLM Breakthrough Explained',
            'source': 'arxiv',
            'viral_score': 5,
            'summary': 'Mixture of Experts architecture simplified',
            'link': 'https://arxiv.org/abs/5678',
            'status': 'published',
            'platform': 'youtube_long',
            'created_at': (datetime.now() - timedelta(days=4)).isoformat(),
        },
    ]
    
    for item in contents:
        c.execute('''
            INSERT INTO content_items 
            (id, title, source, viral_score, summary, link, status, platform, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            item['id'], item['title'], item['source'], item['viral_score'],
            item['summary'], item['link'], item['status'], item['platform'],
            item['created_at'], item['created_at']
        ))
    
    # Seed projects
    projects = [
        {
            'id': 'proj_001',
            'name': 'Daily AI Shorts',
            'description': 'Consistent TikTok/Shorts content about AI breakthroughs',
            'status': 'active',
            'priority': 'high',
            'progress': 65,
            'start_date': '2026-05-01',
            'due_date': '2026-06-01',
            'tags': json.dumps(['short-form', 'daily', 'ai-news']),
        },
        {
            'id': 'proj_002',
            'name': 'Deep Learning Series',
            'description': 'Educational long-form YouTube series on DL fundamentals',
            'status': 'planning',
            'priority': 'medium',
            'progress': 20,
            'start_date': '2026-05-15',
            'due_date': '2026-07-01',
            'tags': json.dumps(['education', 'youtube', 'series']),
        },
        {
            'id': 'proj_003',
            'name': 'Viral Hooks Experiment',
            'description': 'A/B testing different hook styles for maximum retention',
            'status': 'active',
            'priority': 'urgent',
            'progress': 45,
            'start_date': '2026-05-20',
            'due_date': '2026-05-30',
            'tags': json.dumps(['experiment', 'analytics', 'growth']),
        },
    ]
    
    for proj in projects:
        c.execute('''
            INSERT INTO projects 
            (id, name, description, status, priority, progress, start_date, due_date, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            proj['id'], proj['name'], proj['description'], proj['status'],
            proj['priority'], proj['progress'], proj['start_date'], proj['due_date'], proj['tags']
        ))
    
    # Seed tasks
    tasks = [
        {'id': 'task_001', 'project_id': 'proj_001', 'title': 'Set up posting schedule', 'completed': 1, 'assignee': 'Admin'},
        {'id': 'task_002', 'project_id': 'proj_001', 'title': 'Create 5 scripts for next week', 'completed': 0, 'assignee': 'Admin'},
        {'id': 'task_003', 'project_id': 'proj_001', 'title': 'Review analytics from last week', 'completed': 1, 'assignee': 'Admin'},
        {'id': 'task_004', 'project_id': 'proj_002', 'title': 'Outline episode 1', 'completed': 0, 'assignee': 'Admin'},
        {'id': 'task_005', 'project_id': 'proj_003', 'title': 'Record 10 hook variations', 'completed': 0, 'assignee': 'Admin'},
    ]
    
    for task in tasks:
        c.execute('''
            INSERT INTO tasks (id, project_id, title, completed, assignee, due_date)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (task['id'], task['project_id'], task['title'], task['completed'], task['assignee'], None))
    
    conn.commit()
    conn.close()
    print("Demo data seeded successfully!")

if __name__ == '__main__':
    seed()