"""
Research Agent - Fetches AI/ML news from free sources
"""
import feedparser
import requests
import re
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from config.settings import *
from src.dashboard_store import sync_research_stories

try:
    import praw
    PRAW_AVAILABLE = True
except ImportError:
    PRAW_AVAILABLE = False


class ResearchAgent:
    def __init__(self):
        self.reddit = None
        if PRAW_AVAILABLE and REDDIT_CLIENT_ID:
            try:
                self.reddit = praw.Reddit(
                    client_id=REDDIT_CLIENT_ID,
                    client_secret=REDDIT_CLIENT_SECRET,
                    user_agent=REDDIT_USER_AGENT
                )
            except Exception as e:
                print(f"Reddit init failed: {e}")
        
        self.sources = {
            'arxiv_ai': 'http://export.arxiv.org/rss/cs.AI',
            'arxiv_ml': 'http://export.arxiv.org/rss/cs.LG',
            'arxiv_cl': 'http://export.arxiv.org/rss/cs.CL',
            'hackernews': 'https://hnrss.org/newest?points=100',
        }
        
        self.subreddits = ['MachineLearning', 'artificial', 'LocalLLaMA']
    
    def fetch_arxiv(self, limit: int = 5) -> List[Dict]:
        """Fetch latest papers from arXiv RSS (free, no API key needed)"""
        stories = []
        for name, url in self.sources.items():
            if not name.startswith('arxiv'):
                continue
            try:
                print(f"Fetching {name}...")
                feed = feedparser.parse(url)
                for entry in feed.entries[:limit]:
                    stories.append({
                        'source': name,
                        'title': self._clean_text(entry.title),
                        'summary': self._clean_text(entry.get('summary', ''))[:400],
                        'link': entry.link,
                        'published': entry.get('published', ''),
                        'viral_score': self._score_virality(entry.title, entry.get('summary', ''))
                    })
            except Exception as e:
                print(f"Error fetching {name}: {e}")
        return stories
    
    def fetch_reddit(self, limit: int = 5) -> List[Dict]:
        """Fetch trending posts from Reddit (free API)"""
        if not self.reddit:
            print("Reddit not configured. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.")
            return []
        
        stories = []
        for sub in self.subreddits:
            try:
                print(f"Fetching r/{sub}...")
                for post in self.reddit.subreddit(sub).hot(limit=limit):
                    if post.score < 30:
                        continue
                    stories.append({
                        'source': f'reddit_{sub}',
                        'title': self._clean_text(post.title),
                        'summary': self._clean_text(post.selftext)[:300] if post.selftext else '',
                        'link': post.url,
                        'score': post.score,
                        'comments': post.num_comments,
                        'viral_score': self._score_virality(post.title, post.selftext)
                    })
            except Exception as e:
                print(f"Error fetching r/{sub}: {e}")
        return stories
    
    def fetch_hackernews(self, limit: int = 5) -> List[Dict]:
        """Fetch top stories from Hacker News (free RSS)"""
        try:
            print("Fetching Hacker News...")
            feed = feedparser.parse(self.sources['hackernews'])
            stories = []
            for entry in feed.entries[:limit]:
                stories.append({
                    'source': 'hackernews',
                    'title': self._clean_text(entry.title),
                    'summary': self._clean_text(entry.get('summary', ''))[:300],
                    'link': entry.link,
                    'viral_score': self._score_virality(entry.title, entry.get('summary', ''))
                })
            return stories
        except Exception as e:
            print(f"Error fetching HN: {e}")
            return []
    
    def _score_virality(self, title: str, summary: str = '') -> int:
        """Score 1-10 based on viral potential keywords"""
        text = f"{title} {summary}".lower()
        score = 5
        
        # Viral boost keywords
        boost = {
            'breakthrough': 2, 'revolutionary': 2, 'free': 2,
            'open source': 2, 'beats': 2, 'better than': 2,
            'shocking': 2, 'insane': 2, 'warning': 2,
            'chatgpt': 1, 'gpt': 1, 'claude': 1, 'deepseek': 2,
            'new model': 1, 'just released': 2, 'faster': 1,
            'replace': 2, 'job': 1, 'jobs': 1,
        }
        
        for keyword, points in boost.items():
            if keyword in text:
                score += points
        
        # Penalty for overly academic
        penalty = ['theorem', 'lemma', 'convergence', 'gradient descent proof']
        for kw in penalty:
            if kw in text:
                score -= 2
        
        return max(1, min(10, score))
    
    def _clean_text(self, text: str) -> str:
        """Clean HTML tags and extra whitespace"""
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def generate_daily_brief(self) -> str:
        """Generate markdown brief of top stories"""
        all_stories = []
        all_stories.extend(self.fetch_arxiv(5))
        all_stories.extend(self.fetch_reddit(5))
        all_stories.extend(self.fetch_hackernews(5))
        
        # Sort by viral score
        all_stories.sort(key=lambda x: x['viral_score'], reverse=True)
        top_stories = all_stories[:MAX_STORIES_PER_DAY]

        try:
            synced = sync_research_stories(top_stories)
            print(f"Dashboard sync: {synced} real stories saved")
        except Exception as e:
            print(f"Dashboard sync warning: {e}")
        
        # Generate brief
        date_str = datetime.now().strftime('%Y-%m-%d')
        brief_path = BRIEFS_DIR / f"{date_str}-brief.md"
        
        md = f"# AI News Brief — {date_str}\n\n"
        md += f"Generated: {datetime.now().strftime('%H:%M')}\n"
        md += f"Stories: {len(top_stories)}\n\n"
        md += "## Top Stories\n\n"
        
        for i, story in enumerate(top_stories, 1):
            md += f"### {i}. {story['title']}\n"
            md += f"- **Source**: {story['source']}\n"
            md += f"- **Viral Score**: {story['viral_score']}/10\n"
            md += f"- **Link**: {story['link']}\n"
            if story.get('score'):
                md += f"- **Reddit Score**: {story['score']} upvotes\n"
            md += f"- **Summary**: {story.get('summary', 'N/A')[:200]}...\n\n"
        
        brief_path.write_text(md, encoding='utf-8')
        print(f"\nBrief saved: {brief_path}")
        return str(brief_path)


if __name__ == "__main__":
    agent = ResearchAgent()
    agent.generate_daily_brief()