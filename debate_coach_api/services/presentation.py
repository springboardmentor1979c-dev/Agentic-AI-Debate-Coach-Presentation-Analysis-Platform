"""Presentation analysis engine — NLP + prosody heuristics + LLM coaching."""
import json
import re
from models.models import PresentationAnalysis
from services.llm_engine import call_llm, parse_llm_json

FILLER_WORDS = {"um", "uh", "like", "you know", "basically", "literally", "actually", "so", "right", "okay", "well"}

EMOTION_KEYWORDS = {
    "confident": ["clearly", "certainly", "definitely", "absolutely", "undoubtedly"],
    "nervous": ["um", "uh", "maybe", "perhaps", "i think", "i guess"],
    "passionate": ["must", "critical", "essential", "vital", "urgent", "crucial"],
    "bored": ["whatever", "anyway", "moving on", "next"],
}


def _detect_emotion(text: str) -> str:
    text_lower = text.lower()
    scores = {emotion: sum(1 for kw in kws if kw in text_lower) for emotion, kws in EMOTION_KEYWORDS.items()}
    return max(scores, key=scores.get) if any(scores.values()) else "neutral"


def _count_fillers(words: list[str]) -> tuple[int, dict]:
    detail = {}
    for w in words:
        clean = w.strip(".,!?;:")
        if clean in FILLER_WORDS:
            detail[clean] = detail.get(clean, 0) + 1
    return sum(detail.values()), detail


def analyze_presentation(db, analysis: PresentationAnalysis, use_llm: bool = True) -> PresentationAnalysis:
    words = analysis.transcript.lower().split()
    word_count = len(words)

    # Estimate duration: assume 130 wpm average speaking pace
    estimated_minutes = max(1, word_count / 130)
    analysis.speech_pace = round(word_count / estimated_minutes, 1)

    filler_count, filler_detail = _count_fillers(words)
    analysis.filler_word_count = filler_count
    analysis.filler_words_detail = json.dumps(filler_detail)

    # Heuristic scores
    analysis.confidence_score = round(max(0.0, min(10.0, 10 - (filler_count * 0.25))), 2)
    analysis.clarity_score = round(min(10.0, word_count / 25), 2)
    analysis.engagement_score = round(min(10.0, (word_count / 40) + (1.5 if "?" in analysis.transcript else 0)), 2)
    analysis.emotion_detected = _detect_emotion(analysis.transcript)

    # Sentence length variance as proxy for pitch variation
    sentences = re.split(r"[.!?]", analysis.transcript)
    lengths = [len(s.split()) for s in sentences if s.strip()]
    if len(lengths) > 1:
        mean_len = sum(lengths) / len(lengths)
        variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
        analysis.pitch_variation = round(min(10.0, variance / 5), 2)
    else:
        analysis.pitch_variation = 0.0

    # Pause frequency: count ellipses and long punctuation
    analysis.pause_frequency = round(analysis.transcript.count("...") + analysis.transcript.count(",") / 10, 2)

    analysis.overall_score = round(
        analysis.confidence_score * 0.30
        + analysis.clarity_score * 0.35
        + analysis.engagement_score * 0.20
        + analysis.pitch_variation * 0.15,
        2,
    )

    # LLM coaching tips
    if use_llm:
        prompt = f"""Analyze this presentation transcript and provide coaching feedback:

Transcript (first 800 chars): {analysis.transcript[:800]}

Metrics:
- Speech pace: {analysis.speech_pace} wpm (ideal: 120-150)
- Filler words: {filler_count} (top fillers: {list(filler_detail.keys())[:3]})
- Confidence score: {analysis.confidence_score}/10
- Clarity score: {analysis.clarity_score}/10
- Emotion detected: {analysis.emotion_detected}

Provide: coaching_tips (list of 4 specific tips), strengths (list of 2), improvement_areas (list of 2)
Respond in JSON."""
        response, _, _ = call_llm(prompt, "You are an expert presentation coach and speech trainer.")
        llm_result = parse_llm_json(response)
        analysis.llm_coaching = json.dumps(llm_result)

        tips = llm_result.get("coaching_tips", [])
        pace_note = "too fast" if analysis.speech_pace > 160 else ("too slow" if analysis.speech_pace < 100 else "good pace")
        analysis.feedback = (
            f"Pace: {analysis.speech_pace} wpm ({pace_note}). "
            f"Fillers: {filler_count}. Score: {analysis.overall_score}/10. "
            + (" | ".join(tips[:2]) if tips else "")
        )
    else:
        pace_note = "too fast" if analysis.speech_pace > 160 else ("too slow" if analysis.speech_pace < 100 else "good pace")
        analysis.feedback = (
            f"Speech pace: {analysis.speech_pace} wpm ({pace_note}). "
            f"Filler words: {filler_count}. Overall: {analysis.overall_score}/10. "
            f"{'Reduce filler words.' if filler_count > 5 else 'Good filler control.'}"
        )

    db.commit()
    db.refresh(analysis)
    return analysis
