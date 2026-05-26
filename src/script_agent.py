"""
Script Agent - Generates prompts for Claude/ChatGPT
"""
import re
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from jinja2 import Template
from config.settings import *


class ScriptAgent:
    def __init__(self):
        self.templates = {
            'tiktok': self._tiktok_template(),
            'youtube_short': self._youtube_short_template(),
        }
    
    def _tiktok_template(self) -> Template:
        return Template("""You are a viral short-form video scriptwriter for AI/tech news.

BRAND VOICE:
- Talk like explaining to a smart friend at coffee
- NO jargon. Explain technical terms in 5 words max
- Pattern interrupts every 3-5 seconds
- End with curiosity gap or strong CTA
- MAX 130 words (45-60 seconds at 150 WPM)

SCRIPT STRUCTURE:
[HOOK - 0-3 sec]: Pattern interrupt. Start mid-sentence or shocking claim.
[SETUP - 3-12 sec]: What happened + why normal people care.
[REVEAL - 12-40 sec]: Surprising insight or "what they won't tell you."
[CTA - 40-60 sec]: Engagement trigger + follow CTA.

STORY:
Title: {{ title }}
Source: {{ source }}
Summary: {{ summary }}
Viral Score: {{ viral_score }}/10

OUTPUT:
Return ONLY the script with [HOOK], [SETUP], etc. markers.
Also suggest:
1. 3 hook variations (A/B/C)
2. On-screen text overlays (max 5 words each)
3. B-roll suggestions
4. 3-5 hashtags
""")
    
    def _youtube_short_template(self) -> Template:
        return Template("""Write a YouTube Shorts script about this AI news.

TONE: Slightly more educational than TikTok
- Include one "did you know" factoid
- Mention source for credibility
- Optimize for search: include key terms
- 130-150 words (50-65 seconds)

STORY:
Title: {{ title }}
Source: {{ source }}
Summary: {{ summary }}

OUTPUT: Full script with [HOOK], [SETUP], [REVEAL], [CTA] + search-optimized title + description.
""")
    
    def generate_prompts(self, brief_path: str) -> List[Dict]:
        """Generate ready-to-paste prompts from brief"""
        content = Path(brief_path).read_text(encoding='utf-8')
        stories = self._parse_brief(content)
        
        prompts = []
        for story in stories:
            for platform in ['tiktok', 'youtube_short']:
                template = self.templates[platform]
                prompt = template.render(**story)
                
                prompts.append({
                    'platform': platform,
                    'story_title': story['title'],
                    'prompt': prompt,
                    'output_file': DRAFTS_DIR / f"{datetime.now().strftime('%Y-%m-%d')}-{platform}-{self._slug(story['title'][:40])}.md"
                })
        
        return prompts
    
    def _parse_brief(self, content: str) -> List[Dict]:
        """Parse markdown brief into story dicts"""
        stories = []
        sections = re.split(r'### \d+\.\s+', content)
        
        for section in sections[1:]:
            lines = section.strip().split('\n')
            if not lines:
                continue
            
            title = lines[0].strip()
            source = re.search(r'\*\*Source\*\*:\s*(.+)', section)
            viral = re.search(r'\*\*Viral Score\*\*:\s*(\d+)/10', section)
            link = re.search(r'\*\*Link\*\*:\s*(.+)', section)
            summary = re.search(r'\*\*Summary\*\*:\s*(.+)', section)
            
            stories.append({
                'title': title,
                'source': source.group(1) if source else 'Unknown',
                'viral_score': int(viral.group(1)) if viral else 5,
                'link': link.group(1) if link else '',
                'summary': summary.group(1) if summary else ''
            })
        
        return stories
    
    def _slug(self, text: str) -> str:
        return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')
    
    def save_prompts(self, prompts: List[Dict]):
        """Save prompts to files for manual copying to Claude/ChatGPT"""
        for p in prompts:
            content = f"# {p['platform'].upper()} Prompt: {p['story_title']}\n\n"
            content += f"**Platform**: {p['platform']}\n"
            content += f"**Story**: {p['story_title']}\n\n"
            content += "---\n\n"
            content += p['prompt']
            
            p['output_file'].write_text(content, encoding='utf-8')
            print(f"Prompt saved: {p['output_file']}")


if __name__ == "__main__":
    agent = ScriptAgent()
    
    briefs = sorted(BRIEFS_DIR.glob("*-brief.md"))
    if not briefs:
        print("No briefs found. Run research_agent.py first.")
        exit(1)
    
    latest_brief = briefs[-1]
    prompts = agent.generate_prompts(str(latest_brief))
    agent.save_prompts(prompts)
    
    print(f"\nGenerated {len(prompts)} prompts.")
    print("Copy prompts from data/drafts/ into Claude Pro or ChatGPT Plus.")