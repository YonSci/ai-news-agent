"""
Video Agent - Creates videos using free tools (MoviePy, PIL, gTTS)
"""
from __future__ import annotations

import os
import re
import json
import numpy as np
from pathlib import Path
from typing import List, Dict
from datetime import datetime
from config.settings import *

try:
    from moviepy import (
        VideoClip,
        AudioFileClip,
        TextClip,
        CompositeVideoClip,
        concatenate_videoclips,
    )
    from PIL import Image, ImageDraw, ImageFont
    from gtts import gTTS
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False
    print("Warning: MoviePy not installed. Video generation disabled.")


class VideoAgent:
    def __init__(self):
        self.assets_dir = ASSETS_DIR
        self.width = VIDEO_WIDTH
        self.height = VIDEO_HEIGHT
    
    def create_video(self, script_path: str, output_name: str = None) -> str:
        """Create video from script file"""
        if not MOVIEPY_AVAILABLE:
            raise RuntimeError("MoviePy not installed. Run: pip install moviepy pillow gtts pydub")
        
        script_text = Path(script_path).read_text(encoding='utf-8')
        sections = self._parse_script(script_text)
        
        if not sections:
            raise ValueError("No valid script sections found")
        
        # Generate audio and visuals for each section
        clips = []
        for section in sections:
            audio_path = self._generate_tts(section['text'], section['type'])
            audio = AudioFileClip(audio_path)
            visual = self._generate_visual(section, audio.duration)
            clips.append(self._attach_audio(visual, audio))
        
        # Combine all sections
        final_video = concatenate_videoclips(clips, method="compose")
        
        # Add captions overlay
        final_video = self._add_captions(final_video, sections)
        
        # Export
        if not output_name:
            timestamp = datetime.now().strftime('%Y-%m-%d-%H%M')
            output_name = f"{timestamp}-ai-news.mp4"
        
        output_path = APPROVED_DIR / output_name
        
        final_video.write_videofile(
            str(output_path),
            fps=FPS,
            codec='libx264',
            audio_codec='aac',
            temp_audiofile=str(ASSETS_DIR / 'temp-audio.m4a'),
            remove_temp=True,
            threads=4,
            preset='fast'
        )

        metadata = {
            'source_script': str(script_path),
            'output_video': str(output_path),
            'created_at': datetime.now().isoformat(),
            'fps': FPS,
            'resolution': {
                'width': self.width,
                'height': self.height,
            },
            'sections': [
                {
                    'type': section['type'],
                    'text': section['text'],
                    'duration': section['duration'],
                    'word_count': section['word_count'],
                }
                for section in sections
            ],
        }
        meta_path = output_path.with_suffix('.json')
        meta_path.write_text(json.dumps(metadata, indent=2), encoding='utf-8')
        
        # Cleanup
        for clip in clips:
            clip.close()
        final_video.close()
        
        print(f"Video created: {output_path}")
        return str(output_path)

    def _attach_audio(self, clip: VideoClip, audio: AudioFileClip) -> VideoClip:
        if hasattr(clip, 'with_audio'):
            return clip.with_audio(audio)
        return clip.set_audio(audio)
    
    def _parse_script(self, script_text: str) -> List[Dict]:
        """Parse script into timed sections"""
        sections = []
        pattern = r'\[(HOOK|SETUP|REVEAL|CTA)\]\s*(.*?)(?=\[(HOOK|SETUP|REVEAL|CTA)\]|$)'
        matches = re.findall(pattern, script_text, re.DOTALL)
        
        for match in matches:
            text = match[1].strip()
            word_count = len(text.split())
            duration = max(3, word_count / 2.2)  # ~130 WPM with pauses
            
            sections.append({
                'type': match[0],
                'text': text,
                'duration': duration,
                'word_count': word_count
            })
        
        return sections
    
    def _generate_tts(self, text: str, section_type: str) -> str:
        """Generate text-to-speech audio"""
        clean_text = re.sub(r'[^\w\s.,!?-]', '', text)
        
        tts = gTTS(text=clean_text, lang='en', slow=False)
        temp_path = ASSETS_DIR / f"tts_{section_type}_{hash(text) % 10000}.mp3"
        tts.save(str(temp_path))
        
        # Speed up slightly for energy
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_mp3(str(temp_path))
            audio = audio.speedup(playback_speed=1.05)
            audio.export(str(temp_path), format="mp3")
        except Exception:
            pass  # Keep original if speedup fails
        
        return str(temp_path)
    
    def _generate_visual(self, section: Dict, duration: float) -> VideoClip:
        """Generate visual clip for a section"""
        colors = {
            'HOOK': {'bg': '#FF006E', 'text': '#FFFFFF', 'accent': '#FFBE0B'},
            'SETUP': {'bg': '#0A0A0A', 'text': '#FFFFFF', 'accent': '#3A86FF'},
            'REVEAL': {'bg': '#FB5607', 'text': '#FFFFFF', 'accent': '#FFBE0B'},
            'CTA': {'bg': '#8338EC', 'text': '#FFFFFF', 'accent': '#FF006E'}
        }
        
        scheme = colors.get(section['type'], colors['SETUP'])
        
        def make_frame(t):
            # Create base image
            img = Image.new('RGB', (self.width, self.height), scheme['bg'])
            draw = ImageDraw.Draw(img)
            
            # Try to load a bold font, fallback to default
            try:
                # Windows font path
                font_paths = [
                    "C:/Windows/Fonts/arialbd.ttf",
                    "C:/Windows/Fonts/segoeuib.ttf",
                    "C:/Windows/Fonts/calibrib.ttf",
                ]
                font_large = None
                for fp in font_paths:
                    if os.path.exists(fp):
                        font_large = ImageFont.truetype(fp, 70)
                        font_small = ImageFont.truetype(fp, 40)
                        break
                
                if not font_large:
                    font_large = ImageFont.load_default()
                    font_small = font_large
            except Exception:
                font_large = ImageFont.load_default()
                font_small = font_large
            
            # Wrap text to fit screen
            words = section['text'].split()
            lines = []
            current_line = []
            
            for word in words:
                test = ' '.join(current_line + [word])
                bbox = draw.textbbox((0, 0), test, font=font_large)
                if bbox[2] - bbox[0] < self.width - 100:
                    current_line.append(word)
                else:
                    lines.append(' '.join(current_line))
                    current_line = [word]
            if current_line:
                lines.append(' '.join(current_line))
            
            # Draw text centered
            line_height = 80
            total_height = len(lines) * line_height
            y_start = (self.height - total_height) // 2
            
            for i, line in enumerate(lines):
                bbox = draw.textbbox((0, 0), line, font=font_large)
                text_width = bbox[2] - bbox[0]
                x = (self.width - text_width) // 2
                y = y_start + i * line_height
                
                # Subtle shadow
                draw.text((x+2, y+2), line, font=font_large, fill='#00000040')
                draw.text((x, y), line, font=font_large, fill=scheme['text'])
            
            # Add section label at top
            label = f"[ {section['type']} ]"
            bbox = draw.textbbox((0, 0), label, font=font_small)
            draw.text((40, 40), label, font=font_small, fill=scheme['accent'])
            
            # Progress bar at bottom
            progress = t / duration
            bar_width = int(self.width * progress)
            draw.rectangle([0, self.height-10, bar_width, self.height], fill=scheme['accent'])
            
            return np.array(img)
        
        return VideoClip(make_frame, duration=duration)
    
    def _add_captions(self, video: VideoClip, sections: List[Dict]) -> VideoClip:
        """Add burned-in captions (key for sound-off viewers)"""
        txt_clips = []
        current_time = 0
        
        for section in sections:
            # Show first 4-5 words as caption
            words = section['text'].split()[:5]
            caption = ' '.join(words) + '...'
            
            try:
                txt = TextClip(
                    text=caption,
                    font_size=55,
                    color='yellow',
                    stroke_color='black',
                    stroke_width=2,
                    font='Arial-Bold',
                    size=(self.width - 100, None),
                    method='caption'
                )
            except Exception:
                txt = TextClip(
                    text=caption,
                    font_size=55,
                    color='yellow',
                    stroke_color='black',
                    stroke_width=2,
                    size=(self.width - 100, None),
                    method='caption'
                )

            if hasattr(txt, 'with_position'):
                txt = txt.with_position(('center', self.height - 250))
                txt = txt.with_start(current_time)
                txt = txt.with_duration(section['duration'])
            else:
                txt = txt.set_position(('center', self.height - 250))
                txt = txt.set_start(current_time)
                txt = txt.set_duration(section['duration'])
            
            txt_clips.append(txt)
            current_time += section['duration']
        
        return CompositeVideoClip([video] + txt_clips)


if __name__ == "__main__":
    if not MOVIEPY_AVAILABLE:
        print("Install dependencies first: pip install moviepy pillow gtts pydub numpy")
        exit(1)
    
    agent = VideoAgent()
    # Example: agent.create_video("path/to/script.md")
    print("VideoAgent ready. Use create_video(script_path) to generate.")