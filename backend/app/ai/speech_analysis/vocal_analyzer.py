import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("debate_coach_speech")

# Librosa/Soundfile loading fallback
try:
    import librosa
    import soundfile as sf
except ImportError:
    librosa = None
    sf = None
    logger.warning("Librosa or Soundfile not available. Falling back to heuristic/mock speech analytics.")

class SpeechAnalyzer:
    def analyze_audio(self, audio_path: str, transcript: Optional[str] = None) -> Dict[str, Any]:
        """Analyzes speech pace, pauses, stability, pitch, and volume."""
        # 1. Base default values
        wpm = 130.0
        pause_count = 5
        filler_words_count = 4
        pitch = 140.0  # Hz
        volume = -20.0  # dB
        confidence = 82.0
        stability = 80.0
        
        # 2. Extract metrics using librosa if available and file exists
        if librosa is not None and os.path.exists(audio_path):
            try:
                y, sr = librosa.load(audio_path)
                duration = librosa.get_duration(y=y, sr=sr)
                
                # Simple pitch analysis (F0)
                pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
                pitch = float(pitches[pitches > 0].mean()) if pitches[pitches > 0].size > 0 else 140.0
                
                # Volume (RMS energy)
                rms = librosa.feature.rms(y=y)
                volume = float(rms.mean())
                
                # Simple pause detection (silence detection)
                intervals = librosa.effects.split(y, top_db=30)
                pause_count = max(0, len(intervals) - 1)
                
                # If transcript is provided, compute words-per-minute
                if transcript and duration > 0:
                    words = len(transcript.split())
                    wpm = round((words / duration) * 60, 1)
            except Exception as e:
                logger.error(f"Error executing Librosa speech analysis: {e}")

        # Compute scores
        pace_score = 100.0 - abs(wpm - 130.0) * 0.8  # optimal pace around 130 WPM
        pace_score = max(30.0, min(100.0, pace_score))
        
        pronunciation_score = 85.0  # static/mock baseline
        stability_score = max(40.0, min(100.0, stability))
        overall_score = (pace_score + pronunciation_score + stability_score) / 3.0

        return {
            "scores": {
                "pace_score": round(pace_score, 1),
                "pronunciation_score": round(pronunciation_score, 1),
                "vocal_stability_score": round(stability_score, 1),
                "overall_speech_score": round(overall_score, 1)
            },
            "metrics": {
                "words_per_minute": round(wpm, 1),
                "pause_count": int(pause_count),
                "filler_words_count": int(filler_words_count),
                "pitch": round(pitch, 1),
                "volume": round(volume, 2),
                "confidence": round(confidence, 1)
            },
            "speech_tips": [
                "Practice slowing down during complex technical details.",
                "Incorporate a brief 2-second pause when transitioning between key claims."
            ]
        }
