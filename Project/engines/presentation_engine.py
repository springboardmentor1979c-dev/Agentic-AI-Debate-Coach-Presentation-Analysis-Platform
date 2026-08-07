"""
Presentation Analysis Engine
Analyzes presentation transcripts for:
  - Speech Pace (WPM proxy)
  - Filler Word Usage
  - Confidence Score
  - Clarity Score
  - Audience Engagement Score
"""
from __future__ import annotations

import re
import os
import json
from dataclasses import dataclass, asdict
from typing import List

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

_FILLER_WORDS = [
    "uh", "um", "er", "ah", "like", "you know", "basically", "literally",
    "actually", "sort of", "kind of", "i mean", "right?", "okay so",
    "so yeah", "and stuff", "or whatever",
]

_CONFIDENCE_BOOSTERS = [
    "clearly", "definitely", "certainly", "absolutely", "evidence shows",
    "research confirms", "data proves", "without doubt", "I am confident",
]

_ENGAGEMENT_MARKERS = [
    "imagine", "consider this", "have you ever", "what if", "think about",
    "let me ask you", "the question is", "here's the thing", "for example",
    "story", "case study", "let's explore",
]


@dataclass
class PresentationScore:
    word_count: int
    estimated_duration_minutes: float  # assuming 130 wpm average
    speech_pace: str  # "slow" | "ideal" | "fast"
    filler_word_count: int
    filler_words_found: List[str]
    filler_rate: float  # fillers per 100 words
    confidence_score: float  # 0-10
    clarity_score: float  # 0-10
    engagement_score: float  # 0-10
    overall_presentation_score: float  # 0-10
    feedback: str
    improvement_tips: List[str]


def _rule_analyze(transcript: str, duration_minutes: float | None = None) -> PresentationScore:
    text = transcript.lower()
    word_count = len(transcript.split())
    
    # --- Pace ---
    est_duration = duration_minutes if duration_minutes else word_count / 130
    if est_duration > 0:
        wpm = word_count / est_duration
    else:
        wpm = 130  # default
    
    if wpm < 100:
        pace = "slow"
    elif wpm <= 160:
        pace = "ideal"
    else:
        pace = "fast"

    # --- Filler words ---
    found_fillers = []
    for fw in _FILLER_WORDS:
        pattern = r'\b' + re.escape(fw) + r'\b'
        matches = re.findall(pattern, text)
        if matches:
            found_fillers.extend(matches)
    filler_count = len(found_fillers)
    filler_rate = round((filler_count / max(word_count, 1)) * 100, 2)

    # --- Confidence ---
    confidence_hits = sum(1 for cb in _CONFIDENCE_BOOSTERS if cb in text)
    passive_voice_count = len(re.findall(r'\b(was|were|is|are|been)\s+\w+ed\b', text))
    confidence_score = min(10.0, max(1.0,
        7 + confidence_hits * 0.5 - passive_voice_count * 0.3 - filler_rate * 0.2
    ))

    # --- Clarity ---
    sentences = [s.strip() for s in re.split(r'[.!?]', transcript) if s.strip()]
    avg_sentence_len = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
    long_words = sum(1 for w in transcript.split() if len(w) > 10)
    long_word_ratio = long_words / max(word_count, 1)
    clarity_score = min(10.0, max(1.0,
        9 - (abs(avg_sentence_len - 15) * 0.2) - (long_word_ratio * 10) - filler_rate * 0.1
    ))

    # --- Engagement ---
    engagement_hits = sum(1 for em in _ENGAGEMENT_MARKERS if em in text)
    question_count = transcript.count('?')
    exclamation_count = transcript.count('!')
    engagement_score = min(10.0, max(1.0,
        4 + engagement_hits * 0.8 + question_count * 0.4 + exclamation_count * 0.2
    ))

    # --- Overall ---
    overall = round(
        confidence_score * 0.30 +
        clarity_score * 0.30 +
        engagement_score * 0.25 +
        (10 - min(filler_rate * 2, 10)) * 0.15,
        2
    )

    # --- Tips ---
    tips = []
    if filler_rate > 5:
        tips.append(f"Reduce filler words (found {filler_count}). Practice pausing silently instead.")
    if pace == "fast":
        tips.append("Slow down — aim for 130-160 WPM to allow audience comprehension.")
    elif pace == "slow":
        tips.append("Increase your pace slightly to maintain audience engagement.")
    if confidence_score < 6:
        tips.append("Use more assertive language. Replace 'kind of' and 'sort of' with direct statements.")
    if clarity_score < 6:
        tips.append("Vary sentence length — mix short punchy statements with longer explanatory sentences.")
    if engagement_score < 6:
        tips.append("Add rhetorical questions, stories, or 'imagine if' scenarios to engage the audience.")

    feedback = (
        f"Overall presentation score: {overall}/10. "
        f"Pace: {pace} (~{int(wpm)} WPM). "
        f"Filler rate: {filler_rate}%. "
        + ("Excellent presentation!" if overall >= 7.5 else "Good effort — see improvement tips below.")
    )

    return PresentationScore(
        word_count=word_count,
        estimated_duration_minutes=round(est_duration, 2),
        speech_pace=pace,
        filler_word_count=filler_count,
        filler_words_found=list(set(found_fillers))[:10],
        filler_rate=filler_rate,
        confidence_score=round(confidence_score, 2),
        clarity_score=round(clarity_score, 2),
        engagement_score=round(engagement_score, 2),
        overall_presentation_score=overall,
        feedback=feedback,
        improvement_tips=tips,
    )


_LLM_PRESENTATION_PROMPT = """You are an expert public speaking coach. Analyze the following presentation transcript.
Return ONLY valid JSON (no markdown):
{{
  "word_count": <int>,
  "estimated_duration_minutes": <float>,
  "speech_pace": "<slow|ideal|fast>",
  "filler_word_count": <int>,
  "filler_words_found": ["<word>"],
  "filler_rate": <float>,
  "confidence_score": <float 0-10>,
  "clarity_score": <float 0-10>,
  "engagement_score": <float 0-10>,
  "overall_presentation_score": <float 0-10>,
  "feedback": "<paragraph>",
  "improvement_tips": ["<tip1>", "<tip2>", "<tip3>"]
}}

Transcript: {transcript}
"""


def _llm_analyze(transcript: str, duration_minutes: float | None) -> PresentationScore:
    try:
        import openai
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        prompt = _LLM_PRESENTATION_PROMPT.format(transcript=transcript[:3000])
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=700,
        )
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        return PresentationScore(**data)
    except Exception:
        return _rule_analyze(transcript, duration_minutes)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def analyze_presentation(transcript: str, duration_minutes: float | None = None) -> dict:
    """Analyze a presentation transcript and return scored metrics."""
    if OPENAI_API_KEY:
        result = _llm_analyze(transcript, duration_minutes)
    else:
        result = _rule_analyze(transcript, duration_minutes)
    return asdict(result)
