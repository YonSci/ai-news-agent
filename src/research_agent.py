"""
Research Agent - Fetches AI news from free public sources.
"""
import hashlib
import feedparser
import requests
import re
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from urllib.parse import quote_plus, urljoin

from bs4 import BeautifulSoup

from config.settings import *
from src.dashboard_store import sync_news_items


class ResearchAgent:
    def __init__(self, github_token: str | None = None):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
        })
        self.github_token = (github_token or GITHUB_TOKEN or '').strip()
        self.github_headers = {'Accept': 'application/vnd.github+json'}
        if self.github_token:
            self.github_headers['Authorization'] = f'Bearer {self.github_token}'

    def collect_news(self, per_source_limit: int = NEWS_MAX_PER_SOURCE) -> List[Dict]:
        items: List[Dict] = []
        items.extend(self.fetch_rss_sources(per_source_limit))
        items.extend(self.scrape_company_pages(per_source_limit))
        items.extend(self.fetch_hackernews_keywords(per_source_limit))
        items.extend(self.fetch_github_releases(per_source_limit))
        return self._dedupe_and_rank(items)

    def fetch_rss_sources(self, limit: int = 5) -> List[Dict]:
        items: List[Dict] = []
        for source_name, url in NEWS_RSS_FEEDS.items():
            try:
                print(f"Fetching RSS: {source_name}...")
                feed = feedparser.parse(url)
                for entry in feed.entries[:limit]:
                    items.append(self._normalize_item(
                        source=source_name,
                        source_type='rss',
                        title=getattr(entry, 'title', ''),
                        summary=getattr(entry, 'summary', '') or getattr(entry, 'description', ''),
                        url=getattr(entry, 'link', ''),
                        published_at=self._parse_entry_datetime(entry),
                        category='AI News',
                        tags=[source_name.replace('_', ' ')],
                    ))
            except Exception as e:
                print(f"Error fetching RSS {source_name}: {e}")
        return items

    def scrape_company_pages(self, limit: int = 5) -> List[Dict]:
        items: List[Dict] = []
        for source_name, page_url in NEWS_COMPANY_PAGES.items():
            try:
                print(f"Scraping page: {source_name}...")
                response = self.session.get(page_url, timeout=20)
                response.raise_for_status()
                soup = BeautifulSoup(response.text, 'html.parser')
                items.extend(self._extract_page_items(source_name, page_url, soup, limit))
            except Exception as e:
                print(f"Error scraping {source_name}: {e}")
        return items

    def fetch_hackernews_keywords(self, limit: int = 5) -> List[Dict]:
        items: List[Dict] = []
        seen = set()
        for keyword in NEWS_HN_KEYWORDS:
            try:
                print(f"Searching HN for: {keyword}...")
                url = f"https://hn.algolia.com/api/v1/search?query={quote_plus(keyword)}&tags=story&hitsPerPage={limit}"
                response = self.session.get(url, timeout=20)
                response.raise_for_status()
                payload = response.json()
                for hit in payload.get('hits', []):
                    item = self._normalize_item(
                        source='hackernews',
                        source_type='hn_search',
                        title=hit.get('title') or '',
                        summary=hit.get('story_text') or hit.get('comment_text') or hit.get('title') or '',
                        url=hit.get('url') or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        published_at=self._unix_to_iso(hit.get('created_at_i')),
                        category='Hacker News',
                        tags=['hackernews', keyword],
                    )
                    if item['dedupe_hash'] not in seen:
                        seen.add(item['dedupe_hash'])
                        items.append(item)
            except Exception as e:
                print(f"Error searching HN for {keyword}: {e}")
        return items

    def fetch_github_releases(self, limit: int = 5) -> List[Dict]:
        items: List[Dict] = []
        seen = set()

        for label, feed_url in NEWS_GITHUB_RELEASE_FEEDS.items():
            try:
                print(f"Fetching GitHub releases: {label}...")
                feed = feedparser.parse(feed_url)
                for entry in feed.entries[:limit]:
                    item = self._normalize_item(
                        source='github',
                        source_type='release_feed',
                        title=f"{label}: {getattr(entry, 'title', 'release')}",
                        summary=getattr(entry, 'summary', '') or getattr(entry, 'description', ''),
                        url=getattr(entry, 'link', ''),
                        published_at=self._parse_entry_datetime(entry),
                        category='GitHub Releases',
                        tags=['github', label],
                    )
                    if item['dedupe_hash'] not in seen:
                        seen.add(item['dedupe_hash'])
                        items.append(item)
            except Exception as e:
                print(f"Error fetching GitHub releases for {label}: {e}")

        if self.github_token:
            for query in NEWS_GITHUB_RELEASE_QUERIES:
                try:
                    label = query.get('label', 'GitHub Release')
                    search_query = query.get('query', '')
                    print(f"Searching GitHub repos for: {label}...")
                    search_url = f"https://api.github.com/search/repositories?q={quote_plus(search_query)}&sort=updated&order=desc&per_page={limit}"
                    search_resp = self.session.get(search_url, timeout=20, headers=self.github_headers)
                    search_resp.raise_for_status()
                    repos = search_resp.json().get('items', [])
                    for repo in repos[:limit]:
                        full_name = repo.get('full_name')
                        if not full_name:
                            continue
                        release_url = f"https://api.github.com/repos/{full_name}/releases/latest"
                        release_resp = self.session.get(release_url, timeout=20, headers=self.github_headers)
                        if release_resp.status_code == 404:
                            continue
                        release_resp.raise_for_status()
                        release = release_resp.json()
                        item = self._normalize_item(
                            source='github',
                            source_type='release',
                            title=f"{repo.get('name', full_name)} {release.get('name') or release.get('tag_name') or 'release'}",
                            summary=release.get('body') or repo.get('description') or '',
                            url=release.get('html_url') or repo.get('html_url', ''),
                            published_at=release.get('published_at') or repo.get('updated_at'),
                            category='GitHub Releases',
                            tags=['github', label],
                        )
                        if item['dedupe_hash'] not in seen:
                            seen.add(item['dedupe_hash'])
                            items.append(item)
                except Exception as e:
                    print(f"Error fetching GitHub releases for {query.get('label', 'unknown')}: {e}")

        return items

    def _normalize_item(
        self,
        source: str,
        source_type: str,
        title: str,
        summary: str,
        url: str,
        published_at: str | None,
        category: str,
        tags: List[str],
    ) -> Dict:
        clean_title = self._clean_text(title)
        clean_summary = self._clean_text(summary or '')
        link = (url or '').strip()
        dedupe_hash = hashlib.sha1(f"{source}:{link or clean_title.lower()}".encode('utf-8')).hexdigest()
        score = self._score_relevance(clean_title, clean_summary, tags, source)
        return {
            'source': source,
            'source_type': source_type,
            'source_url': link,
            'title': clean_title,
            'summary': clean_summary[:600],
            'url': link,
            'published_at': published_at or datetime.now().isoformat(),
            'category': category,
            'tags': tags,
            'viral_score': score,
            'relevance_score': score,
            'dedupe_hash': dedupe_hash,
            'item_type': 'news',
            'status': 'new',
            'platform': 'news',
        }

    def _score_relevance(self, title: str, summary: str, tags: List[str], source: str) -> int:
        text = f"{title} {summary} {' '.join(tags)} {source}".lower()
        score = 5
        boosts = {
            'openai': 2,
            'anthropic': 2,
            'deepmind': 2,
            'google': 1,
            'cursor': 2,
            'codex': 2,
            'claude': 2,
            'release': 1,
            'launch': 1,
            'ai': 1,
            'llm': 1,
            'agent': 1,
            'model': 1,
            'benchmark': 1,
        }
        for keyword, points in boosts.items():
            if keyword in text:
                score += points
        penalties = ['theorem', 'lemma', 'convergence', 'proof sketch']
        for keyword in penalties:
            if keyword in text:
                score -= 2
        return max(1, min(10, score))

    def _parse_entry_datetime(self, entry) -> str:
        for field in ('published_parsed', 'updated_parsed'):
            parsed = getattr(entry, field, None)
            if parsed:
                return datetime(*parsed[:6]).isoformat()
        return datetime.now().isoformat()

    def _unix_to_iso(self, value) -> str:
        try:
            if value:
                return datetime.fromtimestamp(int(value)).isoformat()
        except Exception:
            pass
        return datetime.now().isoformat()

    def _extract_page_items(self, source_name: str, page_url: str, soup: BeautifulSoup, limit: int) -> List[Dict]:
        items: List[Dict] = []
        articles = soup.select('article') or soup.select('main article') or []

        for article in articles[:limit]:
            title_node = article.select_one('h1, h2, h3, h4, a')
            link_node = article.select_one('a[href]')
            summary_node = article.select_one('p')
            time_node = article.select_one('time')
            title = title_node.get_text(' ', strip=True) if title_node else ''
            href = link_node.get('href') if link_node else page_url
            href = urljoin(page_url, href)
            summary = summary_node.get_text(' ', strip=True) if summary_node else ''
            published = time_node.get('datetime') if time_node else None
            if title:
                items.append(self._normalize_item(
                    source=source_name,
                    source_type='web',
                    title=title,
                    summary=summary,
                    url=href,
                    published_at=published,
                    category='Company News',
                    tags=[source_name.replace('_', ' ')],
                ))

        if not items:
            for link in soup.select('a[href]'):
                title = link.get_text(' ', strip=True)
                href = urljoin(page_url, link.get('href'))
                if len(title) < 20:
                    continue
                items.append(self._normalize_item(
                    source=source_name,
                    source_type='web',
                    title=title,
                    summary='',
                    url=href,
                    published_at=datetime.now().isoformat(),
                    category='Company News',
                    tags=[source_name.replace('_', ' ')],
                ))
                if len(items) >= limit:
                    break

        return items[:limit]

    def _dedupe_and_rank(self, items: List[Dict]) -> List[Dict]:
        deduped: Dict[str, Dict] = {}
        for item in items:
            key = item.get('dedupe_hash') or item.get('url') or item.get('title')
            if not key:
                continue
            existing = deduped.get(key)
            if not existing or item['relevance_score'] > existing['relevance_score']:
                deduped[key] = item
        return sorted(deduped.values(), key=lambda item: (item['relevance_score'], item['published_at']), reverse=True)
    
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
        """Legacy virality heuristic used by tests and fallback source adapters."""
        text = f"{title} {summary}".lower()
        score = 5

        hype_boosts = {
            'chatgpt': 2,
            'free': 1,
            'upgrade': 1,
            'beats': 1,
            'breakthrough': 1,
            'launch': 1,
            'viral': 1,
            'trending': 1,
            'ai': 1,
            'model': 1,
            'agent': 1,
        }
        for keyword, points in hype_boosts.items():
            if keyword in text:
                score += points

        academic_penalties = ['theorem', 'lemma', 'convergence', 'proof', 'arxiv']
        for keyword in academic_penalties:
            if keyword in text:
                score -= 2

        return max(1, min(10, score))
    
    def _clean_text(self, text: str) -> str:
        """Clean HTML tags and extra whitespace"""
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def generate_daily_brief(self) -> str:
        """Generate markdown brief of top stories"""
        all_stories = self.collect_news()
        top_stories = all_stories[:MAX_STORIES_PER_DAY]

        try:
            synced = sync_news_items(all_stories)
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
            md += f"- **Category**: {story.get('category', 'AI News')}\n"
            md += f"- **Relevance Score**: {story.get('relevance_score', story.get('viral_score', 5))}/10\n"
            md += f"- **Link**: {story.get('url') or story.get('link')}\n"
            if story.get('published_at'):
                md += f"- **Published**: {story['published_at']}\n"
            if story.get('tags'):
                md += f"- **Tags**: {', '.join(story['tags'])}\n"
            md += f"- **Summary**: {story.get('summary', 'N/A')[:200]}...\n\n"
        
        brief_path.write_text(md, encoding='utf-8')
        print(f"\nBrief saved: {brief_path}")
        return str(brief_path)


if __name__ == "__main__":
    agent = ResearchAgent()
    agent.generate_daily_brief()