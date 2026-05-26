"""
Tests for Research Agent
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.research_agent import ResearchAgent


def test_score_virality():
    agent = ResearchAgent()
    
    # Test high viral score
    score = agent._score_virality("ChatGPT just got a free upgrade that beats everything")
    assert score >= 7
    
    # Test low viral score (academic)
    score = agent._score_virality("On the convergence of gradient descent in high dimensions")
    assert score <= 4
    
    # Test neutral
    score = agent._score_virality("New AI model released today")
    assert 4 <= score <= 7


def test_clean_text():
    agent = ResearchAgent()
    dirty = "  Hello <b>world</b>  with  spaces  "
    clean = agent._clean_text(dirty)
    assert "<b>" not in clean
    assert "  " not in clean
    assert clean == "Hello world with spaces"