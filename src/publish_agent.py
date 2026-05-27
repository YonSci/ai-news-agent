"""
Publish Agent - Uploads to YouTube (free API) and prepares TikTok packages
"""
import os
import re
import json
import pickle
import requests
from pathlib import Path
from typing import Dict, List
from datetime import datetime
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
        self.api_base_url = TIKTOK_API_BASE_URL.rstrip('/')
        self.access_token = TIKTOK_ACCESS_TOKEN

    def is_auto_configured(self) -> bool:
        return bool(self.access_token)

    def _auth_headers(self) -> Dict[str, str]:
        if not self.access_token:
            raise RuntimeError("Missing TIKTOK_ACCESS_TOKEN")
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
        }

    def _api_post(self, endpoint: str, payload: Dict) -> Dict:
        url = f"{self.api_base_url}{endpoint}"
        response = requests.post(url, headers=self._auth_headers(), json=payload, timeout=60)
        try:
            body = response.json()
        except Exception:
            body = {'raw': response.text}

        if response.status_code >= 400:
            raise RuntimeError(f"TikTok API error {response.status_code}: {body}")
        if isinstance(body, dict) and body.get('error'):
            raise RuntimeError(f"TikTok API returned error: {body['error']}")
        return body if isinstance(body, dict) else {'data': body}

    def upload_video_auto(self, video_path: str, title: str, description: str,
                          hashtags: List[str] = None) -> Dict:
        """Upload video through TikTok Content Posting API (requires approved app + token)."""
        video = Path(video_path)
        if not video.exists():
            raise FileNotFoundError(f"Video not found: {video}")

        hashtag_text = ' '.join(f"#{tag}" for tag in (hashtags or []))
        caption = f"{description}\n{hashtag_text}".strip()[:2200]
        video_size = video.stat().st_size

        init_payload = {
            'post_info': {
                'title': (title or 'AI News')[:90],
                'description': caption,
                'privacy_level': TIKTOK_PRIVACY_LEVEL,
                'disable_comment': TIKTOK_DISABLE_COMMENT,
                'disable_duet': TIKTOK_DISABLE_DUET,
                'disable_stitch': TIKTOK_DISABLE_STITCH,
            },
            'source_info': {
                'source': 'FILE_UPLOAD',
                'video_size': video_size,
                'chunk_size': video_size,
                'total_chunk_count': 1,
            },
        }

        init_resp = self._api_post('/v2/post/publish/video/init/', init_payload)
        data = init_resp.get('data', init_resp)

        upload_url = data.get('upload_url') or data.get('video_upload_url')
        publish_id = data.get('publish_id') or data.get('publishId')
        if not upload_url:
            raise RuntimeError(f"TikTok init response missing upload_url: {init_resp}")

        with open(video, 'rb') as f:
            upload_resp = requests.put(upload_url, data=f, timeout=300)
        if upload_resp.status_code >= 400:
            raise RuntimeError(
                f"TikTok upload failed {upload_resp.status_code}: {upload_resp.text[:500]}"
            )

        return {
            'publish_id': publish_id,
            'status': 'upload_completed',
            'init_response': init_resp,
        }
    
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
        tiktok_title = metadata.get('tiktok_title', 'AI News')
        tiktok_desc = metadata.get('tiktok_description', '#AI #ML')
        tiktok_tags = metadata.get('hashtags') or metadata.get('tags')

        if TIKTOK_AUTO_UPLOAD and self.tiktok.is_auto_configured():
            try:
                auto_result = self.tiktok.upload_video_auto(
                    video_path=video_path,
                    title=tiktok_title,
                    description=tiktok_desc,
                    hashtags=tiktok_tags,
                )
                results['tiktok'] = 'auto_upload_started'
                if auto_result.get('publish_id'):
                    results['tiktok_publish_id'] = auto_result['publish_id']
            except Exception as e:
                results['tiktok_error'] = str(e)
                try:
                    self.tiktok.prepare_package(
                        video_path=video_path,
                        title=tiktok_title,
                        description=tiktok_desc,
                        hashtags=tiktok_tags,
                    )
                    results['tiktok_fallback'] = 'package_created'
                except Exception as package_error:
                    results['tiktok_fallback_error'] = str(package_error)
        else:
            try:
                self.tiktok.prepare_package(
                    video_path=video_path,
                    title=tiktok_title,
                    description=tiktok_desc,
                    hashtags=tiktok_tags,
                )
                results['tiktok'] = 'package_created'
            except Exception as e:
                results['tiktok_error'] = str(e)
        
        return results


if __name__ == "__main__":
    print("PublishAgent ready.")
    print("YouTube: Requires client_secrets.json from Google Cloud Console")
    print("TikTok: Set TIKTOK_AUTO_UPLOAD=1 + TIKTOK_ACCESS_TOKEN for automatic upload")