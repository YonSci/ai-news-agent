"""
Publish Agent - Uploads to YouTube (free API) and prepares TikTok packages
"""
import os
import json
import pickle
from pathlib import Path
from typing import Dict, List
from config.settings import *

try:
    from googleapiclient.discovery import build
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    YT_AVAILABLE = True
except ImportError:
    YT_AVAILABLE = False


class YouTubePublisher:
    """YouTube Data API v3 - free tier: 10,000 units/day"""
    SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
    
    def __init__(self):
        if not YT_AVAILABLE:
            raise RuntimeError("Google API client not installed")
        self.credentials = None
        self.service = None
        self._authenticate()
    
    def _authenticate(self):
        """OAuth2 flow - run once, saves token for future"""
        token_path = BASE_DIR / 'config' / 'youtube_token.pickle'
        
        if token_path.exists():
            with open(token_path, 'rb') as token:
                self.credentials = pickle.load(token)
        
        if not self.credentials or not self.credentials.valid:
            if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                self.credentials.refresh(Request())
            else:
                if not YOUTUBE_CLIENT_SECRETS_FILE.exists():
                    raise FileNotFoundError(
                        f"Create YouTube OAuth credentials at Google Cloud Console\n"
                        f"Download client_secrets.json and save to: {YOUTUBE_CLIENT_SECRETS_FILE}"
                    )
                
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(YOUTUBE_CLIENT_SECRETS_FILE), self.SCOPES)
                self.credentials = flow.run_local_server(port=8080)
            
            with open(token_path, 'wb') as token:
                pickle.dump(self.credentials, token)
        
        self.service = build('youtube', 'v3', credentials=self.credentials)
        print("YouTube authentication successful")
    
    def upload_short(self, video_path: str, title: str, description: str,
                     tags: List[str] = None, category_id: str = "28") -> str:
        """
        Upload as YouTube Short
        Category 28 = Science & Technology
        """
        from googleapiclient.http import MediaFileUpload
        
        # Ensure #Shorts in title or description for Shorts shelf
        if '#Shorts' not in title and '#Shorts' not in description:
            description += "\n\n#Shorts #AI #MachineLearning"
        
        body = {
            'snippet': {
                'title': title[:100],  # Max 100 chars
                'description': description[:5000],
                'tags': tags or ['AI', 'Machine Learning', 'Tech News', 'Shorts'],
                'categoryId': category_id
            },
            'status': {
                'privacyStatus': 'private',  # Start private, review then publish
                'selfDeclaredMadeForKids': False
            }
        }
        
        media = MediaFileUpload(
            str(video_path),
            mimetype='video/mp4',
            resumable=True
        )
        
        request = self.service.videos().insert(
            part='snippet,status',
            body=body,
            media_body=media
        )
        
        response = None
        while response is None:
            status, response = request.next_chunk()
            if status:
                print(f"Upload progress: {int(status.progress() * 100)}%")
        
        video_id = response['id']
        print(f"Uploaded: https://youtube.com/shorts/{video_id}")
        return video_id


class TikTokPublisher:
    """
    TikTok Publishing - Creates ready-to-upload packages
    Full API requires developer approval (free but takes 1-2 weeks)
    Apply at: https://developers.tiktok.com/
    """
    def __init__(self):
        self.ready_dir = APPROVED_DIR / "tiktok_ready"
        self.ready_dir.mkdir(exist_ok=True)
    
    def prepare_package(self, video_path: str, title: str, description: str,
                       hashtags: List[str] = None) -> str:
        """Create TikTok-ready package with metadata"""
        import shutil
        
        # Copy video with clean name
        safe_title = re.sub(r'[^\w\s-]', '', title)[:50].strip()
        dest = self.ready_dir / f"{safe_title}.mp4"
        shutil.copy(video_path, dest)
        
        # Save metadata JSON
        meta = {
            'title': title,
            'description': description,
            'hashtags': hashtags or ['AI', 'MachineLearning', 'TechNews'],
            'video_path': str(dest),
            'created': datetime.now().isoformat()
        }
        
        meta_path = self.ready_dir / f"{safe_title}.json"
        meta_path.write_text(json.dumps(meta, indent=2), encoding='utf-8')
        
        print(f"TikTok package ready: {self.ready_dir}")
        print(f"Upload manually at: https://www.tiktok.com/upload")
        return str(dest)


class PublishingOrchestrator:
    def __init__(self):
        self.youtube = None
        self.tiktok = TikTokPublisher()
    
    def publish(self, video_path: str, metadata: Dict):
        """Publish to all platforms"""
        results = {}
        
        # YouTube
        if YT_AVAILABLE:
            try:
                if not self.youtube:
                    self.youtube = YouTubePublisher()
                
                yt_id = self.youtube.upload_short(
                    video_path=video_path,
                    title=metadata.get('youtube_title', 'AI News Update'),
                    description=metadata.get('youtube_description', 'Daily AI news'),
                    tags=metadata.get('tags', [])
                )
                results['youtube'] = yt_id
            except Exception as e:
                results['youtube_error'] = str(e)
        else:
            results['youtube'] = 'yt_api_not_installed'
        
        # TikTok package
        try:
            self.tiktok.prepare_package(
                video_path=video_path,
                title=metadata.get('tiktok_title', 'AI News'),
                description=metadata.get('tiktok_description', '#AI #ML'),
                hashtags=metadata.get('hashtags')
            )
            results['tiktok'] = 'package_created'
        except Exception as e:
            results['tiktok_error'] = str(e)
        
        return results


if __name__ == "__main__":
    print("PublishAgent ready.")
    print("YouTube: Requires client_secrets.json from Google Cloud Console")
    print("TikTok: Manual upload or apply for API at developers.tiktok.com")