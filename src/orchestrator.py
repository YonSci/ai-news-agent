"""
Orchestrator - Main controller for the AI News Agent pipeline
"""
import sys
import time
import schedule
from datetime import datetime
from pathlib import Path
from config.settings import *


class Orchestrator:
    def __init__(self):
        self.log_file = LOGS_DIR / "agent.log"
    
    def log(self, message: str):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        line = f"[{timestamp}] {message}\n"
        
        # Append to log
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(line)
        print(line.strip())
    
    def run_research(self):
        """Stage 1: Fetch news and generate brief"""
        self.log("=" * 50)
        self.log("STAGE 1: RESEARCH")
        self.log("=" * 50)
        
        try:
            from src.research_agent import ResearchAgent
            agent = ResearchAgent()
            brief_path = agent.generate_daily_brief()
            self.log(f"SUCCESS: Brief saved to {brief_path}")
            return brief_path
        except Exception as e:
            self.log(f"FAILED: {e}")
            return None
    
    def generate_prompts(self, brief_path: str = None):
        """Stage 2: Generate script prompts for Claude/ChatGPT"""
        self.log("=" * 50)
        self.log("STAGE 2: SCRIPT PROMPTS")
        self.log("=" * 50)
        
        if not brief_path:
            briefs = sorted(BRIEFS_DIR.glob("*-brief.md"))
            if not briefs:
                self.log("No briefs found. Run research first.")
                return
            brief_path = str(briefs[-1])
        
        try:
            from src.script_agent import ScriptAgent
            agent = ScriptAgent()
            prompts = agent.generate_prompts(brief_path)
            agent.save_prompts(prompts)
            self.log(f"SUCCESS: {len(prompts)} prompts generated in data/drafts/")
            self.log("NEXT: Copy prompts to Claude Pro or ChatGPT Plus")
        except Exception as e:
            self.log(f"FAILED: {e}")
    
    def create_video(self, script_path: str = None):
        """Stage 3: Generate video from approved script"""
        self.log("=" * 50)
        self.log("STAGE 3: VIDEO PRODUCTION")
        self.log("=" * 50)
        
        if not script_path:
            scripts = sorted(APPROVED_DIR.glob("*.md"))
            if not scripts:
                self.log("No approved scripts found in data/approved/")
                self.log("Copy your best script from data/drafts/ to data/approved/")
                return
            script_path = str(scripts[-1])
        
        try:
            from src.video_agent import VideoAgent
            agent = VideoAgent()
            video_path = agent.create_video(script_path)
            self.log(f"SUCCESS: Video created at {video_path}")
            return video_path
        except Exception as e:
            self.log(f"FAILED: {e}")
            return None
    
    def publish(self, video_path: str = None):
        """Stage 4: Publish to platforms"""
        self.log("=" * 50)
        self.log("STAGE 4: PUBLISHING")
        self.log("=" * 50)
        
        if not video_path:
            videos = sorted(APPROVED_DIR.glob("*.mp4"))
            if not videos:
                self.log("No videos found in data/approved/")
                return
            video_path = str(videos[-1])
        
        # Load metadata if exists
        meta_path = Path(video_path).with_suffix('.json')
        if meta_path.exists():
            import json
            metadata = json.loads(meta_path.read_text())
        else:
            metadata = {
                'youtube_title': 'AI News: Latest Breakthrough',
                'youtube_description': 'Daily AI and Machine Learning news breakdown. #Shorts #AI',
                'tiktok_title': 'AI News Breakthrough',
                'tiktok_description': '#AI #MachineLearning #TechNews #fyp',
                'tags': ['AI', 'Machine Learning', 'Tech News', 'Artificial Intelligence']
            }
        
        try:
            from src.publish_agent import PublishingOrchestrator
            pub = PublishingOrchestrator()
            results = pub.publish(video_path, metadata)
            
            for platform, result in results.items():
                self.log(f"{platform}: {result}")
        except Exception as e:
            self.log(f"FAILED: {e}")
    
    def run_pipeline(self):
        """Run full automated pipeline (stages 1-2)"""
        self.log("=" * 60)
        self.log("STARTING DAILY PIPELINE")
        self.log("=" * 60)
        
        brief = self.run_research()
        if brief:
            self.generate_prompts(brief)
        
        self.log("Stages 1-2 complete.")
        self.log("MANUAL STEP: Copy prompts to Claude/ChatGPT, paste responses to data/drafts/")
        self.log("MANUAL STEP: Move best script to data/approved/")
        self.log("THEN RUN: python src/orchestrator.py video")
    
    def schedule_daily(self, hour: int = 6, minute: int = 0):
        """Schedule daily runs using schedule library"""
        schedule.every().day.at(f"{hour:02d}:{minute:02d}").do(self.run_pipeline)
        
        self.log(f"Scheduled daily runs at {hour:02d}:{minute:02d}")
        self.log("Press Ctrl+C to stop")
        
        while True:
            schedule.run_pending()
            time.sleep(60)


def print_usage():
    print("""
AI News Agent - Command Reference
================================

Setup:
  1. Activate venv: .venv\\Scripts\\activate.bat
  2. Install deps:   pip install -r requirements.txt

Commands:
  research    - Fetch news and generate brief
  prompts     - Generate script prompts from latest brief
  video       - Create video from approved script
  publish     - Upload to YouTube + prepare TikTok package
  pipeline    - Run stages 1-2 (research + prompts)
  schedule    - Schedule daily runs (runs in background)

Examples:
  python src/orchestrator.py research
  python src/orchestrator.py prompts
  python src/orchestrator.py video
  python src/orchestrator.py pipeline
  python src/orchestrator.py schedule

Workflow:
  1. Run 'pipeline' every morning (or let scheduler run it)
  2. Check data/drafts/ for prompt files
  3. Copy best prompt to Claude Pro / ChatGPT Plus
  4. Paste AI response back to data/drafts/ as .md
  5. Move best script to data/approved/
  6. Run 'video' to generate MP4
  7. Run 'publish' to upload
""")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(0)
    
    orch = Orchestrator()
    command = sys.argv[1].lower()
    
    if command == "research":
        orch.run_research()
    elif command == "prompts":
        orch.generate_prompts()
    elif command == "video":
        script = sys.argv[2] if len(sys.argv) > 2 else None
        orch.create_video(script)
    elif command == "publish":
        video = sys.argv[2] if len(sys.argv) > 2 else None
        orch.publish(video)
    elif command == "pipeline":
        orch.run_pipeline()
    elif command == "schedule":
        orch.schedule_daily()
    else:
        print(f"Unknown command: {command}")
        print_usage()